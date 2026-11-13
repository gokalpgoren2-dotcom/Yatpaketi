import { describe, expect, it } from "vitest";
import { Store } from "@/server/store";
import { loadAgent, parseAgentFile, listAgents } from "@/server/agents";
import { authorize, createSessionToken, verifySessionToken } from "@/server/auth";
import { gateTool, pathAllowed } from "@/server/adapters/claude";
import { routeLocally } from "@/server/adapters/local";
import { getConfig } from "@/server/config";
import { AGENT_IDS } from "@/shared/types";
import { DESKS, ENTRANCE, visitPoint, walkPath, type Pt } from "@/shared/office";

const ws = getConfig().workspace;

describe("görev deposu", () => {
  it("aynı idempotency anahtarıyla ikinci iş açmaz", () => {
    const s = new Store(":memory:");
    const a = s.createJob({ agentId: "seo-agent", prompt: "x", mode: "local", idempotencyKey: "key-12345" });
    const b = s.createJob({ agentId: "seo-agent", prompt: "y", mode: "local", idempotencyKey: "key-12345" });
    expect(a.created).toBe(true);
    expect(b.created).toBe(false);
    expect(b.job.id).toBe(a.job.id);
    expect(s.listJobs()).toHaveLength(1);
  });

  it("güncellemede sürüm numarasını artırır ve olayları sırayla saklar", () => {
    const s = new Store(":memory:");
    const { job } = s.createJob({ agentId: "seo-agent", prompt: "x", mode: "local" });
    expect(s.updateJob(job.id, { status: "working" }).rev).toBe(job.rev + 1);
    s.addEvent(job.id, "tool", { n: 1 });
    const e2 = s.addEvent(job.id, "tool", { n: 2 });
    expect(s.listEvents(job.id).map((e) => e.data.n)).toEqual([1, 2]);
    expect(s.listEvents(job.id, e2.id - 1)).toHaveLength(1);
  });
});

describe("ajan tanımları (.claude/agents)", () => {
  it("sekiz ajanın tanımı geçerli", () => {
    for (const id of AGENT_IDS) {
      const a = loadAgent(id, ws);
      expect(a, id).not.toBeNull();
      expect(a!.description.length).toBeGreaterThan(20);
      expect(a!.prompt).toContain("Ortak kurallar");
    }
    expect(listAgents().every((a) => a.defined)).toBe(true);
  });

  it("en az ayrıcalık: yalnızca gereken araçlar", () => {
    const tools = (id: (typeof AGENT_IDS)[number]) => loadAgent(id, ws)!.tools;
    expect(tools("master-agent")).toEqual(["Read", "Glob", "Grep"]);
    expect(tools("yacht-data-agent")).toEqual(["Read", "Glob", "Grep"]);
    expect(tools("competitor-agent")).toEqual(["WebSearch", "WebFetch"]);
    for (const id of AGENT_IDS) expect(tools(id).includes("Bash"), id).toBe(id === "security-qa-agent");
    for (const id of AGENT_IDS) expect(tools(id).includes("Write"), id).toBe(id === "frontend-agent" || id === "backend-agent");
  });

  it("frontmatter ayrıştırır, bilinmeyen biçimi reddeder", () => {
    expect(parseAgentFile("---\nname: a\ndescription: \"b: c\"\n---\nmetin")).toEqual({ meta: { name: "a", description: "b: c" }, body: "metin" });
    expect(parseAgentFile("frontmatter yok")).toBeNull();
  });
});

describe("araç kapısı", () => {
  const tools = ["Read", "Grep", "Edit", "Bash"];
  it("okuma serbest, yazma ve komut onaya gider, tanımsız araç reddedilir", () => {
    expect(gateTool(tools, ws, "Read", { file_path: "src/app/page.tsx" }).gate).toBe("allow");
    expect(gateTool(tools, ws, "Edit", { file_path: "src/app/page.tsx" }).gate).toBe("ask");
    expect(gateTool(tools, ws, "Bash", { command: "npm run lint" }).gate).toBe("ask");
    expect(gateTool(tools, ws, "Write", { file_path: "a.txt" }).gate).toBe("deny");
    expect(gateTool(tools, ws, "WebFetch", { url: "https://example.com" }).gate).toBe("deny");
  });
  it("gizli dosyalar ve depo dışı yollar reddedilir", () => {
    expect(pathAllowed(ws, ".env.local")).toBe(false);
    expect(pathAllowed(ws, "ai-office/.env")).toBe(false);
    expect(pathAllowed(ws, "../baska/dosya")).toBe(false);
    expect(pathAllowed(ws, "/etc/passwd")).toBe(false);
    expect(pathAllowed(ws, ".env.example.md")).toBe(false);
    expect(pathAllowed(ws, "src/lib/data.ts")).toBe(true);
    expect(gateTool(tools, ws, "Read", { file_path: ".env" }).gate).toBe("deny");
    expect(gateTool(tools, ws, "Bash", { command: "cat .env" }).gate).toBe("deny");
  });
});

describe("oturum", () => {
  it("imzalı çerezi doğrular, bozulmuş ve süresi geçmişi reddeder", () => {
    const t = createSessionToken(1_000);
    expect(verifySessionToken(t, 2_000)).toBe(true);
    expect(verifySessionToken(t.slice(0, -2) + "xx", 2_000)).toBe(false);
    expect(verifySessionToken(t, 1_000 + 13 * 3600_000)).toBe(false);
    expect(verifySessionToken(undefined)).toBe(false);
  });
  it("parolasız kurulumda yalnızca yerel istekleri kabul eder", () => {
    expect(authorize("localhost:3100", undefined, "::ffff:127.0.0.1")).toEqual({ ok: true });
    expect(authorize("localhost:3100", undefined, "203.0.113.9")).toEqual({ ok: false, reason: "locked" });
    expect(authorize("office.example.com", undefined, null)).toEqual({ ok: false, reason: "locked" });
  });
});

describe("ofis yerleşimi", () => {
  const inDesk = (p: Pt) => DESKS.some((d) => p.x > d.gx - 0.1 && p.x < d.gx + 1.7 && p.y > d.gy - 0.1 && p.y < d.gy + 1.3);
  it("yürüme yolları masaların içinden geçmez", () => {
    const points = [ENTRANCE, ...DESKS.map(visitPoint)];
    for (const from of points)
      for (const to of points) {
        let cur = from;
        for (const next of walkPath(from, to)) {
          // yol parçaları eksenlere paraleldir
          expect(Math.abs(next.x - cur.x) < 0.01 || Math.abs(next.y - cur.y) < 0.01).toBe(true);
          for (let t = 0; t <= 1; t += 0.05) expect(inDesk({ x: cur.x + (next.x - cur.x) * t, y: cur.y + (next.y - cur.y) * t })).toBe(false);
          cur = next;
        }
        expect(cur).toEqual(to);
      }
  });
});

describe("yerel yönlendirme", () => {
  it("anahtar kelimeye göre uzman seçer, eşleşme yoksa boş döner", () => {
    expect(routeLocally("Tekne verisi ve SEO durumunu kontrol ettir")).toEqual(["yacht-data-agent", "seo-agent"]);
    expect(routeLocally("Güvenlik taraması başlat")).toEqual(["security-qa-agent"]);
    expect(routeLocally("merhaba")).toEqual([]);
  });
});
