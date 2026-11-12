import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Express API Route for Gemini AI Executive Briefing Generation
app.post('/api/gemini/executive-summary', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY tidak dikonfigurasikan di persekitaran server.' });
    }

    const { date, reports, attendances, rollCalls } = req.body;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
Anda adalah Penolong AI Pengurusan Asrama Sekolah untuk Penolong Kanan Hal Ehwal Murid (PK HEM) SMK Banggi, Kudat, Sabah.
Sila analisis data laporan harian Pembantu Penyelia Asrama (PPA) berikut dan hasilkan "Rumusan Eksekutif Harian PK HEM" yang rasmi, profesional, dan padat dalam Bahasa Melayu.

Tarikh: ${date || new Date().toISOString().split('T')[0]}
Jumlah PPA Bertugas: ${attendances?.length || 0}
Jumlah Laporan Bergambar Dihantar: ${reports?.length || 0}
Data Kehadiran Murid Roll Call: ${JSON.stringify(rollCalls || [])}

Ringkasan Laporan Bergambar:
${(reports || []).map((r: any, idx: number) => `${idx + 1}. [${r.category}] ${r.title} - Penyelia: ${r.ppaName} (${r.status}) | Detail: ${r.description}`).join('\n')}

Format output mestilah JSON sah dengan struktur berikut:
{
  "summaryText": "Perenggan ringkas rumusan keseluruhan operasi asrama hari ini.",
  "highlights": ["Poin pencapaian / perkara utama 1", "Poin 2", "Poin 3"],
  "actionItems": ["Tindakan susulan PK HEM / Warden 1", "Tindakan 2"]
}
Hanya kembalikan JSON sahaja tanpa markdown formatting tambahan.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(textOutput);
    } catch {
      parsedResult = {
        summaryText: textOutput,
        highlights: ['Operasi berjalan mengikut SOP asrama.'],
        actionItems: ['Kekalkan pemantauan berterusan oleh PPA & Warden.'],
      };
    }

    return res.json({ success: true, data: parsedResult });
  } catch (err: any) {
    console.error('Error generating executive summary:', err);
    return res.status(500).json({ error: err.message || 'Gagal menjana rumusan AI.' });
  }
});

// Express API Route for Photo Caption / Damage Inspection Analysis
app.post('/api/gemini/analyze-report', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY tidak dikonfigurasikan.' });
    }

    const { category, title, description, dormBlock } = req.body;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
Anda adalah Pakar Pengurusan Fasiliti & Disiplin Asrama SMK Banggi.
Berdasarkan draf laporan PPA berikut:
- Kategori: ${category}
- Tajuk: ${title}
- Penerangan: ${description}
- Blok: ${dormBlock || 'Umum'}

Berikan 3 cadangan ulasan rasmi PK HEM dan tahap keutamaan yang disyorkan (Biasa / Penting / Segera).

Format output JSON:
{
  "suggestedComments": "Ulasan rasmi disyorkan untuk PK HEM sertakan dalam rekod",
  "recommendedPriority": "Biasa" | "Penting" | "Segera",
  "suggestedFollowUp": "Tindakan susulan pihak sekolah / kontraktor"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    const parsed = JSON.parse(textOutput);
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Gagal menganalisis laporan.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const fs = await import('fs');
        const path = await import('path');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server e-Asrama SMK Banggi running on port ${PORT}`);
  });
}

startServer();
