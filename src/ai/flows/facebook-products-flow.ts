
'use server';
/**
 * @fileOverview Fluxo para buscar produtos de um catálogo do Facebook.
 * - fetchFacebookProducts: Busca produtos de um catálogo específico usando a Graph API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema de entrada (vazio, pois usaremos variáveis de ambiente)
const FacebookProductsInputSchema = z.object({});
export type FacebookProductsInput = z.infer<typeof FacebookProductsInputSchema>;

// Schema de saída para os produtos
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  price: z.string(),
  image_url: z.string().url(),
  url: z.string().url().optional(),
});

const FacebookProductsOutputSchema = z.object({
  products: z.array(ProductSchema),
  error: z.string().optional(),
});
export type FacebookProductsOutput = z.infer<typeof FacebookProductsOutputSchema>;
export type FacebookProduct = z.infer<typeof ProductSchema>;

/**
 * Fluxo Genkit que busca produtos de um catálogo do Facebook.
 */
const fetchFacebookProductsFlow = ai.defineFlow(
  {
    name: 'fetchFacebookProductsFlow',
    inputSchema: FacebookProductsInputSchema,
    outputSchema: FacebookProductsOutputSchema,
  },
  async () => {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const catalogId = '772935848203588'; // ID do seu catálogo de produtos

    if (!accessToken || accessToken === "YOUR_FACEBOOK_PAGE_ACCESS_TOKEN") {
      const errorMessage = "O token de acesso do Facebook (FACEBOOK_PAGE_ACCESS_TOKEN) não está configurado no ambiente do servidor.";
      console.warn(errorMessage);
      return { products: [], error: errorMessage };
    }

    const fields = 'id,name,description,price,image_url,url';
    const url = `https://graph.facebook.com/v20.0/${catalogId}/products?fields=${fields}&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `Erro ao buscar produtos do Facebook: ${errorData.error.message}`;
        console.error("Erro da API do Facebook:", errorData.error);
        return { products: [], error: errorMessage };
      }
      
      const data = await response.json();
      const products = (data.data || []).map((product: any) => ({
          ...product,
          price: product.price || "0.00",
          description: product.description || null
      }));

      return { products };

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar produtos do Facebook:', error);
        return { products: [], error: `Não foi possível carregar os produtos do catálogo. Motivo: ${error.message}` };
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 */
export async function fetchFacebookProducts(): Promise<FacebookProductsOutput> {
    return fetchFacebookProductsFlow({});
}
