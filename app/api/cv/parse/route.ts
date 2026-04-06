import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      // Polyfill DOMMatrix for pdf.js in Node.js environment
      if (typeof global.DOMMatrix === "undefined") {
        (global as any).DOMMatrix = function DOMMatrix() {
          return {
            a:1, b:0, c:0, d:1, e:0, f:0,
            multiply: function() { return this; },
            inverse: function() { return this; },
            translate: function() { return this; },
            scale: function() { return this; }
          };
        };
      }
      
      let pdfParseObj: any;
      if (typeof require !== 'undefined') {
        // Fallback to CJS require in Node environment
        pdfParseObj = require("pdf-parse");
      } else {
        pdfParseObj = await import("pdf-parse");
      }
      
      const pdfParserFunc = typeof pdfParseObj === 'function' ? pdfParseObj : (pdfParseObj.default || pdfParseObj.PDFParse || pdfParseObj);
      
      if (typeof pdfParserFunc !== 'function') {
        throw new Error(`pdf-parse resolved to ${typeof pdfParserFunc}, expected function`);
      }
      
      const data = await pdfParserFunc(buffer);
      text = data.text;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      file.name.toLowerCase().endsWith(".docx")
    ) {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Parse Error Details:", error);
    return NextResponse.json({ error: `Dynamic Parse Error: ${error?.message || String(error)}` }, { status: 500 });
  }
}
