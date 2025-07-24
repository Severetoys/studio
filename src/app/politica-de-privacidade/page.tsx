
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center">
            Política de Privacidade
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground pt-2">
            Última atualização: 02 de setembro de 2024
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>Bem-vindo ao ItaloSantos.com. Nós respeitamos sua privacidade e estamos comprometidos em proteger as informações pessoais que você nos fornece. Esta Política de Privacidade descreve como coletamos, usamos, e protegemos seus dados.</p>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">1. Informações que Coletamos</h3>
            <p>Nós podemos coletar diferentes tipos de informações pessoais e não pessoais, incluindo:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Informações Pessoais:</strong> Nome, e-mail, número de telefone, endereço, e outras informações que você nos fornece voluntariamente através de formulários de contato ou inscrição em nosso site.</li>
              <li><strong>Informações de Navegação:</strong> Dados sobre como você interage com o nosso site, como endereço IP, tipo de navegador, páginas visitadas e tempo gasto em cada página.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">2. Como Usamos Suas Informações</h3>
            <p>As informações que coletamos podem ser usadas para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Melhorar a experiência do usuário em nosso site.</li>
              <li>Personalizar o conteúdo e as ofertas que mostramos para você.</li>
              <li>Processar suas solicitações, como responder a consultas feitas através do formulário de contato.</li>
              <li>Enviar comunicações de marketing, desde que você tenha optado por recebê-las.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">3. Compartilhamento de Informações</h3>
            <p>Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, exceto quando necessário para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cumprir a lei, regulamento, ou ordem judicial.</li>
              <li>Proteger os direitos, propriedade ou segurança de ItaloSantos.com, nossos usuários ou outros.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">4. Cookies</h3>
            <p>Nós utilizamos cookies para melhorar a experiência de navegação em nosso site. Cookies são pequenos arquivos armazenados no seu dispositivo que nos ajudam a entender suas preferências com base em atividades anteriores ou atuais. Você pode optar por desativar os cookies nas configurações do seu navegador, mas isso pode afetar a funcionalidade de algumas partes do site.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">5. Segurança de Dados</h3>
            <p>Implementamos diversas medidas de segurança para proteger suas informações pessoais. No entanto, nenhuma transmissão de dados pela internet é 100% segura, e não podemos garantir a segurança absoluta das informações transmitidas para ou a partir do nosso site.</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">6. Links para Sites de Terceiros</h3>
            <p>Nosso site pode conter links para outros sites. Não somos responsáveis pelas práticas de privacidade ou conteúdo de sites de terceiros. Recomendamos que você leia as políticas de privacidade de qualquer site externo que visitar.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">7. Alterações a Esta Política de Privacidade</h3>
            <p>Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer alterações serão publicadas nesta página, e a data da última atualização será revisada no topo do documento.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">8. Contato</h3>
            <p>Se você tiver alguma dúvida sobre esta Política de Privacidade ou desejar exercer qualquer um de seus direitos de privacidade, entre em contato conosco pelo e-mail italo16rj@gmail.com.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
