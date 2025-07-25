
// src/app/api/upload/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { adminApp } from '@/lib/firebase-admin'; // Ensure admin app is initialized

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bucket = getStorage(adminApp).bucket('authkit-y9vjx.appspot.com');
    const fileName = `italosantos.com/general-uploads/${Date.now()}_${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });

    await new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error("Erro no stream de upload:", err);
        reject(err);
      });
      blobStream.on('finish', () => {
        resolve(true);
      });
      blobStream.end(fileBuffer);
    });

    // Make the file public
    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
    return NextResponse.json({ message: 'Upload bem-sucedido!', url: publicUrl }, { status: 200 });

  } catch (error: any) {
    console.error('[API UPLOAD] Erro:', error);
    return NextResponse.json({ error: `Erro interno do servidor: ${error.message}` }, { status: 500 });
  }
}
