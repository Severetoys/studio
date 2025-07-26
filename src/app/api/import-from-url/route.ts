
import { NextResponse, type NextRequest } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { adminApp } from '@/lib/firebase-admin';
import axios from 'axios';
import { extname } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !URL.canParse(url)) {
      return NextResponse.json({ error: 'URL inválida fornecida.' }, { status: 400 });
    }

    const bucket = getStorage(adminApp).bucket('authkit-y9vjx.appspot.com');
    
    // Baixar o arquivo da URL
    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'arraybuffer'
    });

    if (response.status !== 200) {
        return NextResponse.json({ error: 'Não foi possível baixar o arquivo da URL fornecida.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const originalFileName = new URL(url).pathname.split('/').pop() || `imported_file`;
    const extension = extname(originalFileName);

    const fileName = `italosantos.com/general-uploads/${Date.now()}_${originalFileName.replace(/[^a-zA-Z0-9_.]/g, '_')}${extension || ''}`;
    
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: contentType,
      },
    });

    await new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', resolve);
      blobStream.end(fileBuffer);
    });

    // Tornar o arquivo público
    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
    return NextResponse.json({ 
        message: 'Importação bem-sucedida!', 
        url: publicUrl, 
        fileName: blob.name.split('/').pop() 
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API IMPORT] Erro:', error);
    return NextResponse.json({ error: `Erro interno do servidor: ${error.message}` }, { status: 500 });
  }
}
