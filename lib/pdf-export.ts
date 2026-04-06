import jsPDF from "jspdf";
import type { AnalysisResult } from "@/types";

// ─── Theme Colors ─────────────────────────────────────────────
const C = {
  bg: "#080c10",
  surface: "#0d1219",
  border: "#1a2332",
  text: "#e2e8f0",
  textDim: "#8892a4",
  muted: "#4a5568",
  accent: "#00ff88",
  accentDim: "#00cc6a",
  red: "#f87171",
  amber: "#f5a623",
  white: "#ffffff",
};

const ROLE_COLORS: Record<string, string> = {
  "Full-Stack SWE": "#00ff88",
  "Backend Eng.": "#38bdf8",
  "Frontend Eng.": "#a78bfa",
  "ML Engineer": "#f5a623",
  "DevOps Eng.": "#f87171",
  "Research Eng.": "#4a5568",
};

/**
 * Generate a themed PDF report from analysis data.
 * Uses jsPDF drawing primitives — no html2canvas dependency.
 */
export async function exportDashboardPDF(username: string, data?: AnalysisResult): Promise<void> {
  // If no data passed, try to get from DOM as fallback
  if (!data) {
    throw new Error("Analysis data is required for PDF export");
  }

  const pdf = new jsPDF("p", "mm", "a4");
  const W = 210;
  const H = 297;
  const M = 12; // margin
  const CW = W - M * 2; // content width
  let y = 0;

  // ─── Helper functions ─────────────────────────────────────
  function setColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function fillRect(x: number, yy: number, w: number, h: number, color: string) {
    const { r, g, b } = setColor(color);
    pdf.setFillColor(r, g, b);
    pdf.rect(x, yy, w, h, "F");
  }

  function drawText(text: string, x: number, yy: number, size: number, color: string, style: string = "normal") {
    const { r, g, b } = setColor(color);
    pdf.setTextColor(r, g, b);
    pdf.setFontSize(size);
    pdf.setFont("helvetica", style);
    pdf.text(text, x, yy);
  }

  function drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width = 0.3) {
    const { r, g, b } = setColor(color);
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  }

  function roundRect(x: number, yy: number, w: number, h: number, radius: number, color: string) {
    const { r, g, b } = setColor(color);
    pdf.setFillColor(r, g, b);
    // jsPDF doesn't have roundRect, so use regular rect
    pdf.rect(x, yy, w, h, "F");
  }

  function progressBar(x: number, yy: number, w: number, h: number, pct: number, color: string) {
    fillRect(x, yy, w, h, C.border);
    fillRect(x, yy, w * (pct / 100), h, color);
  }

  function needsNewPage(neededHeight: number): boolean {
    if (y + neededHeight > H - 15) {
      addFooter();
      pdf.addPage();
      drawPageBg();
      y = M;
      return true;
    }
    return false;
  }

  function drawPageBg() {
    fillRect(0, 0, W, H, C.bg);
    // Accent line at top
    fillRect(0, 0, W, 0.8, C.accent);
  }

  function addFooter() {
    drawText(
      `Gintel Report · @${username} · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      W / 2, H - 6, 6, C.muted, "normal"
    );
    // Center the text
    const textWidth = pdf.getTextWidth(`Gintel Report · @${username} · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`);
    // Re-draw centered
    pdf.setFontSize(6);
    pdf.text(
      `Gintel Report · @${username} · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      W / 2, H - 6, { align: "center" }
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PAGE 1: Profile Overview
  // ═══════════════════════════════════════════════════════════
  drawPageBg();
  y = M + 4;

  // Header bar
  drawText("GINTEL", M, y, 10, C.accent, "bold");
  drawText("GitHub Profile Intelligence Report", M + 23, y, 8, C.muted, "normal");
  y += 3;
  drawLine(M, y, W - M, y, C.border);
  y += 8;

  // Profile section
  fillRect(M, y, CW, 38, C.surface);
  drawLine(M, y, M + CW, y, C.border);
  drawLine(M, y + 38, M + CW, y + 38, C.border);

  // Profile info
  const py = y + 8;
  drawText(data.profile.name || username, M + 6, py, 16, C.text, "bold");
  drawText(`@${data.profile.username}`, M + 6, py + 7, 9, C.muted, "normal");

  if (data.profile.bio) {
    drawText(data.profile.bio.slice(0, 80) + (data.profile.bio.length > 80 ? "..." : ""), M + 6, py + 14, 8, C.textDim, "normal");
  }

  // Stats row
  const statsY = py + 22;
  const stats = [
    { label: "Repos", value: String(data.profile.publicRepos) },
    { label: "Followers", value: String(data.profile.followers) },
    { label: "Commits/yr", value: String(data.totalCommitsYear) },
    { label: "Streak", value: `${data.streakDays}d` },
  ];
  stats.forEach((s, i) => {
    const sx = M + 6 + i * 35;
    drawText(s.value, sx, statsY, 10, C.accent, "bold");
    drawText(s.label, sx, statsY + 5, 7, C.muted, "normal");
  });

  // Score circle area (right side)
  const scoreX = W - M - 35;
  drawText(String(data.portfolioScore), scoreX + 8, py + 6, 28, C.accent, "bold");
  drawText("/100", scoreX + 28, py + 6, 10, C.muted, "normal");
  drawText("PORTFOLIO SCORE", scoreX, py + 13, 6, C.muted, "normal");

  // Archetype
  drawText(data.archetype, scoreX, py + 22, 9, C.accent, "bold");
  drawText("ARCHETYPE", scoreX, py + 27, 6, C.muted, "normal");

  y += 44;

  // ─── Score Breakdown ──────────────────────────────────────
  drawText("SCORE BREAKDOWN", M, y, 8, C.text, "bold");
  drawText("6 DIMENSIONS", W - M - 25, y, 7, C.accent, "normal");
  y += 3;
  drawLine(M, y, W - M, y, C.border);
  y += 5;

  const dimColW = (CW - 6) / 3;
  data.scoreBreakdown.dimensions.forEach((dim, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const dx = M + col * (dimColW + 3);
    const dy = y + row * 20;

    fillRect(dx, dy, dimColW, 17, C.surface);
    drawText(dim.label, dx + 3, dy + 5, 7, C.textDim, "normal");
    drawText(`${Math.round(dim.weight * 100)}%`, dx + dimColW - 10, dy + 5, 6, C.muted, "normal");

    const barColor = dim.score >= 80 ? C.accent : dim.score >= 65 ? C.amber : C.red;
    progressBar(dx + 3, dy + 9, dimColW - 20, 2.5, dim.score, barColor);
    drawText(String(dim.score), dx + dimColW - 13, dy + 12, 10, barColor, "bold");
  });

  y += 44;

  // ─── Career Alignment ─────────────────────────────────────
  needsNewPage(55);
  drawText("CAREER ALIGNMENT", M, y, 8, C.text, "bold");
  drawText("ROLE MATCH", W - M - 22, y, 7, C.accent, "normal");
  y += 3;
  drawLine(M, y, W - M, y, C.border);
  y += 5;

  data.careerAlignment.forEach((role) => {
    const color = ROLE_COLORS[role.role] || C.accent;
    drawText(role.role, M + 3, y + 4, 8, C.textDim, "normal");
    progressBar(M + 40, y + 1, CW - 60, 3, role.score, color);
    drawText(String(role.score), W - M - 12, y + 4, 8, color, "bold");
    y += 8;
  });

  y += 4;

  // ─── Language Distribution ────────────────────────────────
  needsNewPage(50);
  drawText("LANGUAGE DISTRIBUTION", M, y, 8, C.text, "bold");
  y += 3;
  drawLine(M, y, W - M, y, C.border);
  y += 5;

  data.languageStats.forEach((lang) => {
    drawText(lang.language, M + 3, y + 4, 8, C.textDim, "normal");
    progressBar(M + 35, y + 1, CW - 55, 3, lang.percentage, lang.color);
    drawText(`${lang.percentage}%`, W - M - 14, y + 4, 8, C.text, "bold");
    y += 8;
  });

  y += 4;

  // ─── Top Repositories ────────────────────────────────────
  needsNewPage(60);
  drawText("TOP REPOSITORIES", M, y, 8, C.text, "bold");
  drawText(`${data.topRepos.length} REPOS`, W - M - 18, y, 7, C.accent, "normal");
  y += 3;
  drawLine(M, y, W - M, y, C.border);
  y += 5;

  data.topRepos.forEach((repo, i) => {
    needsNewPage(22);
    fillRect(M, y, CW, 18, C.surface);

    drawText(`#${i + 1}`, M + 3, y + 5, 7, C.muted, "normal");
    drawText(repo.name, M + 12, y + 5, 9, C.text, "bold");
    drawText(repo.language || "", M + 12 + pdf.getTextWidth(repo.name) * 0.55 + 5, y + 5, 7, C.accent, "normal");

    if (repo.description) {
      drawText(repo.description.slice(0, 70) + (repo.description.length > 70 ? "..." : ""), M + 12, y + 12, 7, C.textDim, "normal");
    }

    // Stars & forks
    drawText(`★ ${repo.stars.toLocaleString()}`, W - M - 35, y + 5, 7, C.amber, "bold");
    drawText(`⑂ ${repo.forks}`, W - M - 15, y + 5, 7, C.muted, "normal");

    // Impact & README scores
    drawText(`Impact: ${repo.impactScore}`, W - M - 40, y + 12, 6, C.muted, "normal");
    drawText(`README: ${repo.readmeScore}`, W - M - 18, y + 12, 6, C.muted, "normal");

    y += 21;
  });

  y += 4;

  // ═══════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════
  needsNewPage(40);
  drawText("INTELLIGENCE RECOMMENDATIONS", M, y, 8, C.text, "bold");
  drawText(`${data.recommendations.length} INSIGHTS`, W - M - 22, y, 7, C.accent, "normal");
  y += 3;
  drawLine(M, y, W - M, y, C.border);
  y += 5;

  data.recommendations.forEach((rec) => {
    const recHeight = 20;
    needsNewPage(recHeight);

    const typeColor = rec.type === "warning" ? C.amber : rec.type === "opportunity" ? C.accent : "#38bdf8";
    const typeLabel = rec.type.toUpperCase();
    const impactLabel = rec.impact.toUpperCase();

    fillRect(M, y, CW, recHeight - 2, C.surface);
    fillRect(M, y, 1.5, recHeight - 2, typeColor); // Left accent strip

    drawText(typeLabel, M + 5, y + 5, 6, typeColor, "bold");
    drawText(impactLabel + " IMPACT", W - M - 25, y + 5, 6, C.muted, "normal");
    drawText(rec.title, M + 5, y + 11, 8, C.text, "bold");

    // Wrap description to fit
    const maxChars = 100;
    const desc = rec.description.slice(0, maxChars) + (rec.description.length > maxChars ? "..." : "");
    drawText(desc, M + 5, y + 16, 6, C.textDim, "normal");

    y += recHeight + 1;
  });

  // Add footer to last page
  addFooter();

  // Save
  const filename = `gintel-report-${username}-${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(filename);
}
