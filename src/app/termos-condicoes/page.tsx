
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TermosECondicoesPage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center">
            Termos e Condições
          </CardTitle>
           <CardDescription className="text-center text-muted-foreground pt-2">
            Última atualização: 02 de setembro de 2024
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
            <p>Bem-vindo ao Italo Santos.com! Ao acessar e usar este site, você concorda com os seguintes Termos e Condições. Se você não concorda com estes termos, por favor, não use este site.</p>
            
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary/90">1. Informações Gerais</h3>
                <p>O site `italosantos.com` é operado por Ítalo Santos, residente no Rio de Janeiro. Para contato, utilize o e-mail italo16rj@gmail.com.</p>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary/90">2. Uso do Site</h3>
                <p>Você concorda em usar o site apenas para fins legais e de maneira que não infrinja os direitos de terceiros, não limite ou iniba o uso e aproveitamento do site por qualquer outra pessoa. Atividades proibidas incluem assediar ou causar desconforto a qualquer pessoa, transmitir conteúdo obsceno ou ofensivo ou interromper o fluxo normal de diálogo dentro deste site.</p>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary/90">3. Direitos de Propriedade Intelectual</h3>
                <p>Todos os direitos de propriedade intelectual e materiais contidos neste site são de propriedade de Ítalo Santos. Você não pode copiar, reproduzir, republicar, baixar, postar, transmitir ou distribuir de qualquer forma o conteúdo deste site, exceto para seu uso pessoal e não comercial.</p>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary/90">4. Limitação de Responsabilidade</h3>
                <p>Embora tenhamos tomado precauções para garantir a exatidão das informações contidas neste site, não podemos garantir que todas as informações estejam corretas ou completas. Não nos responsabilizamos por qualquer perda ou dano que possa resultar do uso das informações contidas neste site.</p>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary/90">5. Alterações aos Termos</h3>
                <p>Reservamos o direito de modificar estes Termos e Condições a qualquer momento. Quaisquer alterações serão publicadas nesta página, e é sua responsabilidade revisar os Termos e Condições regularmente.</p>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary/90">6. Lei Aplicável</h3>
                <p>Estes Termos e Condições são regidos pelas leis brasileiras. Qualquer disputa relacionada a estes Termos e Condições será submetida à jurisdição exclusiva dos tribunais do Brasil.</p>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary/90">7. Contato</h3>
                <p>Se você tiver qualquer dúvida sobre estes Termos e Condições, entre em contato conosco através do e-mail italo16rj@gmail.com.</p>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
