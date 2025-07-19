
"use client";

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { CornerDownRight, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import SiteFooter from './site-footer';
import { Button } from '@/components/ui/button';

interface Review {
  author: string;
  time: string;
  text: string;
  isVerified?: boolean;
  reply?: Review;
}

const MainFooter = () => {

    const galleries = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        title: `Galeria ${i + 1}`,
        photos: Array.from({ length: 5 }, (_, p) => ({
          src: `https://placehold.co/400x800.png`,
          hint: p % 2 === 0 ? "fashion editorial" : "urban model",
          id: p,
          word: "Fetiche" // Palavra de exemplo
        }))
      }));
      
    const reviews: Review[] = [
        { author: 'top', time: '3 dias', text: 'faz passivo?' },
        { author: 'AnonimoSpT', time: '6 dias', text: 'Vários brinquedos, sabe usa-los, sabe fistar e inicar um passivo. Muito putao e delicioso. Chupa um cu dando tesao. Sabe arrombar, "piss inside"...vou repetir' },
        { author: 'Edu', time: '1 semana', text: 'Que delícia de carioca! Gosta do que faz, e faz com vontade. Fez tudo o que combinamos previamente, sem frescuras. Uma rola e bunda de outro planeta. Voltarei mais vezes, com certeza.' },
        { author: 'O Gato Puto', time: '2 semanas', text: 'Que experiência sensacional! Um putão de confiança! Me deixou confortável e a vontade para ir me soltando e me fez de vadia exatamente como pedi! Sai com a bucetinha arrombada e leitada, me sentindo uma fêmea bem vadia' },
        { author: 'Padre Hercilio', time: '2 semanas', text: 'Sou padre da Igreja de verdade e não é segredo que os padres são tudo safado e eu tbm. Esse Italo me atraiu muito. Gostaria de abençoar ele com uma água benta especial: não aquela água benta comum, mas a água benta que vai jorrar do meu jato pau.' },
        { author: 'Mineiro em SP', time: '2 semanas', text: 'Italo é um puta gostoso. Desde o olhar ate os pés. E o sotaque é um charme. Domina bem, manda na situação. Alargou meu cu até onde eu aguentei e depois ainda ficou uma hora metendo sem gozar. Eu teria ficado a noite toda com a pica dele fudendo meu rabo de tão bem que ele mete. Mas da próxima vez eu vou querer ir até onde ele não aguentar mais.' },
        { author: 'Luca', time: '1 mês', text: 'Muito simpático e gosta de entender o que você quer, realmente domina e usa bem, ansioso pra próxima vez. Tem tantos brinquedos pra usar que até me surpreendi' },
        { author: 'André', time: '1 mês', text: 'Ainda vou ter a honra de me ajoelhar aos seus pés e agradecer por essa oportunidade' },
        { author: 'Fan', time: '2 meses', text: 'Curti cada instante desses 60 min. Ele é longo e gostoso. Também é educado, gentil, confiável, no pré e o no pós atendimento. Durante a foda, o senhor da situação e eu sua serva. Apanhei na bunda até chorar e pedir pra parar. Mamei muito a rola, levei mijão no cu, cuspe na boca e claro, muita rola e porra no cu no final. Gozei com ele chupando meus mamilos e dedando meu cuzinho. Um tesão e um prazer muito grande, que recomendo demais. Vocês não vão se arrepender!' },
        { author: 'Manoel', time: '4 meses', text: 'Italo é uma pessoa excepcional, sem erro. Tudo com ele vale a pena .... Um ativo com pegada mas também com envolvimento Tem pelo menos 5 anos que o conheço...' },
        { author: 'Sub pc', time: '5 meses', text: 'Foi uma foda incrível!!!! O melhor com que eu já saí! Com certeza irei em outras oportunidades' },
        { author: 'Copa', time: '6 meses', text: 'Valeu a pena conhecer . Atencioso e bem safado.' },
        { author: 'Bezerrando', time: '6 meses', text: 'Esse é um gostoso que me desatina. O fisting, os brinquedos, a pele da pica roçando no meu cu ... fenomenal. Fora o leite que é uma delícia e vale cada gota. Recomendo.' },
        { author: 'Fabio', time: '9 meses', text: 'Um cara super profissional, sabe realizar fetiches e também sabe ser carinhoso e educado. Sou tímido e ele me deixou super a vontade e confortável. Saí com ele algumas vezes e cada vez é melhor do que a outra. Se você quer um homem que te pegue de jeito mas que também sabe te dar carinho, o Italo é esse cara. Perfeito!!!' },
        { author: '👀', time: '10 meses', text: 'Italo é uma pessoa maravilhosa e quando o assunto é fetiche é o único que conheci que realmente sabe fazer, além de ter um acervo de brinquedos sexuais deliciosos Quando ele nos surpreende é de ficar louco, tipo botar na coleira mandar ajoelhar e te levar até a porta pra receber o entregador do Zé delivery ou quando do nada ele te amarra todo e te leva ao delírio (claro se a pessoa gostar) vale Muito a pena' },
        { author: 'Pedro', time: '11 meses', text: 'O Italo foi maravilhoso, cumpriu tudo que combinamos. Ele é muito simpático, cheguei meio sem jeito, pois, queria experimentar alguns fetiches e ele fez com maestria, conduzindo a situação e me dominando. Quando percebi ele já estava todo dentro de mim. Super recomendo. Obrigado Cara. Bjão' },
        { author: 'Lucas', time: '11 meses', text: 'Um tesão. Cara bacana e gente fina. Com certeza 10/10.' },
        { author: 'passrj', time: '11 meses', text: 'soube como conduzir um iniciante excelente atendimento recomendo a todos !' },
        { author: 'Jota', time: '11 meses', text: 'Hoje ganhei um mestre. Um homem apaixonante. Risco é esse: vc pode se apaixonar! Italo é tudo isso que disseram aí é tudo que não dá para descrever. Um macho com pegada e que beija como ninguém.' },
        { author: 'MARCOS PUTA', time: '11 meses', text: 'Estou cheio de tesão pra fazer uma visita, e ter esse atendimento, de qualidade, que todos tiveram.' },
        { author: 'Renan', time: '11 meses', text: 'De 0 a 10, a note é 11. EXCELENTE' },
        { author: 'João', time: '11 meses', text: 'Se você curte um bom fetiche e tem receio de realizar. Ítalo é o cara! Lindo pra caramba, cheiroso, pauzudo, metedor, calmo mas quando tem que forte, sabe te deixar maluco. Impressionado com ele e com certeza já virei assíduo. Se eu indico? 1000%! Impossível se arrepender.', reply: { author: 'Italo Santos', time: '11 meses', text: 'Você que é uma delícia 🤤', isVerified: true } },
        { author: 'ADV', time: '11 meses', text: 'Me fez de puta. Me deu um Pau amanhecido pra mamar. Eu queria mais, ele chamou um amigo e ambos revesaram meu rabo. O amigo alargava e ele metia. Quase pedi uma DP, mas faltou coragem. Da próxima eu quero!!!! Uma delícia de homem!!!!', reply: { author: 'Italo Santos', time: '11 meses', text: '😛', isVerified: true } },
        { author: 'Pedro', time: '1 ano', text: 'Dominador sáfado na hora do sexo e muito simpático e atencioso antes e depois super recomendo', reply: { author: 'Italo Santos', time: '11 meses', text: 'Foi recíproco a simpatia né chefe', isVerified: true } },
        { author: 'Robson', time: '1 ano', text: 'Matei a saudade deste moreno delicioso. Além do ótimo bate-papo de sempre. Te gosto, meu lindo!', reply: { author: 'Italo Santos', time: '1 ano', text: 'Você que é uma delícia super simpático', isVerified: true } },
        { author: 'Adriano', time: '1 ano', text: 'O Ítalo é simplesmente o melhor garoto de programa que eu já fiquei. Além dele ser lindo, charmoso, gostoso, safado, putão e muito, mas muito bom de cama, ele é um ser humano sensacional. Cara bom de papo, inteligente, educado, honesto, simpático e extremamente gentil. Sou fã dele, pude realizar vários fetiches e só tive experiências maravilhosas. Super indico o trabalho dele.' },
        { author: 'Garoto novo', time: '1 ano', text: 'Estive com ele, e foi sensacional. O beijo dele é maravilhoso, depois transamos intensamente.' },
        { author: 'Lucas', time: '1 ano', text: 'Pessoa maravilhosa, paciente, delicioso excelente profissional, repetiria sempre' },
        { author: 'Ricardo safado', time: '1 ano', text: 'Estive com esse boy no final de semana passado, ele é incrível foi a minha primeira vez realizando fetiche, ele sabe o q está fazendo, foi muito atencioso e educado e dominador ao mesmo tempo . Ele tem uma pegada gostosa e uma rola grande e deliciosa' },
        { author: 'Leo', time: '1 ano', text: 'Um boy perfeito. Pra quem gosta de testar seus limites com fetiches é simplesmente o melhor que encontrei. Vale a pena cada investimento.' },
        { author: 'Novinho Goiânia', time: '1 ano', text: 'O cara é o maior gostoso, me tratou como um príncipe, e sabe meter e levar ao delírio, super recomendo' },
        { author: 'Anônimo', time: '1 ano', text: 'Ótimo atendimento, muito gato e um ótimo dominador' },
        { author: 'B', time: '1 ano', text: 'Esse homem é surreal de gostoso, te deixa a vontade, ele te controla, mas ele entende o que vc quer… que delícia!!! Quero mais vezes…' },
        { author: 'Ignacio', time: '1 ano', text: 'Uma delícia. Educado e safado ao mesmo tempo. Pau gostoso e soca muito.' },
        { author: 'Sandro', time: '1 ano', text: 'Ele é uma pessoa muito especial, muito paciente, educado e carinhoso, esteve comigo sem pressa, foi um momento inesquecível, me deixou todo doido kkkk' },
        { author: 'Fã_BH', time: '2 anos', text: 'Há dois meses estive com ele em BH. Hoje 05/12 me mandou msg e disse q estava aqui. Não perdi tempo. O que já tinha sido ótimo no primeiro encontro, agora foi excelente. Atendimento de primeira, prazeroso e cheio de tesao e dominação . Macho gostoso, dominador. Não erro mais! Vlw meu lindo.' },
        { author: 'Ivan', time: '2 anos', text: 'Pessoa especial, alto astral, transmite alegria de viver e inspira adorável gostosura ? tesão de putaria com respeito e carinho e super profissional. Gosta do que faz. E tem um sorriso lindo e sedutor. Vida longa. Até breve ?' },
        { author: 'Igorz', time: '2 anos', text: 'Bom papo, gostoso, educado, macho! E que pegada! Quero mais vezes!' },
        { author: 'BH', time: '2 anos', text: 'Cara muito massa! Simpático pra caramba, extremamente gostoso. Não estava conseguindo dar pra ele, mas ele foi me deixando com tesao até conseguir meter até o fundo. Estou até agora sentindo. Espero que volte logo a BH.' },
        { author: 'Leo', time: '2 anos', text: 'Excelente atendimento. Tudo perfeito, assim como as informações que estão no site. Fotos reais, macho, dominador se você quiser e também só um bom comedor se quiser apenas transar. Mas é um cara completo, um tesao. Atendimento único, sem correria, sem ser mecânico. Se é a sua primeira vez vai nele, se é a segunda ou terceira com boy, vai nele de novo por que o atendimento é diferenciado, é próprio.' },
        { author: 'Luis', time: '2 anos', text: 'O Ítalo é ótimo, vale muito a pena. Quero mais.' },
        { author: 'Paulo', time: '2 anos', text: 'perfeito.....carinhoso e violento......tudo na medida certa.. Quero mais.' },
        { author: 'Jose', time: '2 anos', text: 'Perfeito.......Uma mistura de carinhoso e intenso.' },
        { author: 'Eu', time: '2 anos', text: 'Não tenho nem palavras pra descrever esse homem brilhante, ele é simplesmente incrível e muito confiável e faz um sexo gostoso como ninguém,,muito atencioso, carinhoso e paciente. Ele é tudo de bom!!!!' },
        { author: 'Lucas', time: '2 anos', text: 'Lindo , muito simpático , me deixou super a vontade a ponto de eu não saber se queria conversar mais ou fuder mais !! E gosta mesmo de meter !!' },
        { author: 'Fulano.', time: '2 anos', text: 'Muito gostoso esse mlk, sou casado estava afim de sentir uma parada diferente e ele me surpreendeu. Quero de novo?' },
        { author: 'Anonimo', time: '3 anos', text: 'O Italo e sensacional. Alem de ser um cara muito gente boa e simpático, trocamos uma ideia maneira, ele tem um bom papo. E no sexo ele é um absurdo de gostoso, uma das melhores transas da minha vida! Me levou a loucura.', reply: { author: 'Alex', time: '2 anos', text: 'Ítalo é muito gostoso e te deixa a vontade. Realiza como ninguém suas fantasias. Ainda é super educado. Vale a pena.' } },
        { author: 'K', time: '3 anos', text: 'Sem comentários É um gostoso, educado e mete muito bem. Pauzudo! Gozei muitooooooooooooo' },
        { author: 'Anônimo Mzh', time: '3 anos', text: 'Cara gente fina, educado, com um pau muito gostoso e bem duro. Pica boa de sentar. Recomendo a todos.' },
        { author: 'Carlos - Niterói', time: '3 anos', text: 'Bom! Hj fui conhecer o Dom Ítalo Ele é lindo, sorriso maroto, parece um modelo! Conversamos um pouco antes! Pois é a primeira vez, que experimento isso! Ele colocou um aparelho que dá choque no cú, deixou ele piscando o tempo todo! Depois colocou uns utensílios nas mãos e pés, me amordacou (tudo com meu consentimento), depois me comeu 2 vezes, até ele gozar! Que cara gostoso! Ele bj os meus mamilos e mordiscou-os, deixando extasiado! Quero-o de novo!' },
        { author: '@', time: '3 anos', text: 'Acabei de sair do apto Ítalo. Ambiente limpo, de fácil acesso e o atendimento dele é ótimo! Foi minha primeira experiência com um fetichista e foi fantástico! Espero poder voltar!' },
        { author: 'Robson', time: '3 anos', text: 'Lindo, gostoso, tranquilo, muito gente boa, pegada inigualável. O Ítalo sabe o que faz! Apesar da pouca idade, é um doutos em matéria de dar prazer.' },
        { author: 'Francisco Rio de Janeiro', time: '3 anos', text: 'O que eu mais gostei no Itálo foi tudo, rss. Realmente ele me recebeu muito bem, me deu o que eu queria, e incansável me fez sentir e ter uma experiência única ao lado dele.', reply: { author: 'Gab', time: '2 anos', text: 'Ele é muito simpático, gostoso e fode muito bem. Eu amei.' } },
        { author: 'De outro estado', time: '3 anos', text: 'Quando falei a primeira com o Ítalo eu pedi pra ele fazer uns fetiches bem loucos comigo. Fui até ele acreditando que ia ser como os outros que prometem e não cumprem...Ele cumpriu tudo o que combinamos e muito mais. O cara é fantástico! Super educado e simpático, mas sabe impor respeito na hora do sexo. Se eu morasse na mesma cidade com ele ia querer sair toda semana com ele hahaha. Ah, ele leva a segurança do cliente bem a sério e sabe respeitar seus limites. Recomendo pra caramba!' },
        { author: 'Luiz', time: '3 anos', text: 'Garoto e bom demais' },
        { author: 'Putao bare', time: '3 anos', text: 'Chupou meu cu demorado, meteu a mão na minha cuceta, me deu um mijada dentro e finalizou com um leitada dentro no pelo.' },
        { author: 'Ale', time: '3 anos', text: 'Estive com ele semana passada, pedi uma sessão de cbt, com direito a chicote, vela quente e choque, tudo isso com as mãos e os pés algemados? cara, que tesão!' },
        { author: 'Gabriel Castro', time: '3 anos', text: 'Fui convidado para atender um cliente com Don Ítalo em São Paulo SP, me surpreendeu com o excelente atendimento, para quem procura humilhação, dominação o garoto está de parabéns, ainda não conheçi ninguém do nível dele. Satisfação garantida, conduz o atendimento sem ser mecânico e de qualidade.' },
        { author: 'Leh', time: '3 anos', text: 'Ítalo super gente boa, bom de papo e atraente, foi a minha primeira experiência como Sub com ele e gostei demais, soube me dominar muito bem e meu muito prazer! Pra quem é iniciante como eu, super recomendo!!!' },
        { author: 'Mineiro', time: '3 anos', text: 'Já estive com Ítalo duas vezes. Além de saber brincar direitinho, ele tem um papo muito agradável. Domina muito bem e tem uma boa coleção de acessórios.' },
        { author: 'Branquinha', time: '3 anos', text: 'Virei puta de vestidinho vagabundo. Apanhei como merecia. Levei porra na cara. Só fiz o que ele mandava. Gostei tanto de ser tratada assim que voltei e não queria ir embora. Me arregaçou. Domínio sedutor. Ítalo é daqueles personagens da literatura erótica e sdm. Nível internacional. Ele é escavador de desejos não ditos.' },
        { author: 'Putão', time: '3 anos', text: 'Foda sensacional, já fiz várias sessões de dominação e putaria sem limites com Italo. Sabe dominar, humilhar, soca e fista até arrombar meu cu. Já me deu muita porra e mijo. Sem contar q ele tem todos os brinquedos e acessórios q eu podia imaginar. Até anaconda gigante ele enfiou em mim. Recomendo pra quem tem experiência e também pra quem quer ser iniciado, porque além de muito puto, ele é educado, limpo e seguro.' },
        { author: 'Rogfaria', time: '3 anos', text: 'Se você gosta de ser tratado como puta, apanhar e tomar leite, esse é o cara! Macho, bonito, gostoso, educado e puto. Super recomendo!' },
        { author: 'Gato bh 32a', time: '3 anos', text: 'Lindo, educado, respeita os limites e sabe dominar. Não vejo a hora dele voltar pra BH pra servi-lo novamente. Bebi mijao, me vestiu de puta, usei coleirinha, algemas, me exibiu pro pessoal da República como sua putinha, fiz video. Tesão. Qro denovo hehehe. Saudades lindo.' },
        { author: 'Lu', time: '3 anos', text: 'É bem difícil achar um garoto que conheça de verdade bdsm, mas o Ítalo é um mestre no assunto, sem falar que tem ótimos acessórios, e sabe muito bem usar, fiquei o tempo todo babando de tesão, valeu cada centavo...o bom é que no dia seguinte vai se olhar no espelho e lembrar....' },
        { author: 'Diego-Florwsta-Bh-Rj', time: '4 anos', text: 'Ele MOLEQUE melhor que nas fotos.e vídeos.... Melhor que.vc magina.. Recomemdo' },
        { author: 'Luixx', time: '4 anos', text: 'Sai com ele ontem, melhor de todos.' },
        { author: 'Cd 25a sp', time: '4 anos', text: 'Encontrei Dom Ítalo no último sábado e nunca me senti tão humilhada na minha vida. Me tratou igual uma puta de verdade e arrombou bem minha cuceta. Sem falar que o pau dele é perfeito, o local é ótimo e os acessórios são excelentes para quem quer ficar cada vez mais largo' },
        { author: 'F', time: '4 anos', text: 'Demais o Ítalo!' },
        { author: 'sub Jock', time: '4 anos', text: 'O Ítalo é Perfeito e Inesquecível ! Não se iluda com a pouca idade dele, porque ele vai te surpreender. Pegada boa e perfeita, nem mais nem menos do que deveria ser e Faz com vontade. Impossível você ficar sem vontade de: quero mais.' },
        { author: 'Bebe', time: '4 anos', text: 'Com esse cara realizei meu sonho de ser a passiva mais puta do mundo. Inesquecível.' },
        { author: 'Batman', time: '4 anos', text: 'Melhor cara que já sai. Podem Ir sem medo, o cara vai sabe tratar um Viado do jeito que viado merece.' },
        { author: 'Anonimo', time: '4 anos', text: 'O Ítalo é daquelas pessoas que deixa saudades. Super educado, safado, nada apressado, me fez gozar sem eu nem encostar no pau. Fala bastante putaria e domina muito bem. Isso sem falar nos inúmeros brinquedos que ele tem na casa dele' },
        { author: 'Garoto safado', time: '4 anos', text: 'Tesao de macho deve levar o puto a loucura. Eu queria ser obsecrados desse macho.' },
        { author: 'Pankado', time: '4 anos', text: 'Sempre me oferece um adicional bom, pra puxar no pau. Chupa bem um cu, bomba bem e tem brinquedos gostosos. Tá sempre f1 e gosta do que faz. Nota 10.' },
        { author: 'Trabalha em ipanema', time: '5 anos', text: 'Piroca gostosa , baste leite soca gostoso e carinhoso .Quando posso vou sempre fude com ele pica muito gostosa' },
        { author: 'Italo', time: '5 anos', text: 'leito farto' },
        { author: 'Rodrigo', time: '5 anos', text: 'Que pau gostoso de mamar. Eh grande mesmo. E jorra bem.' }
    ];

    const ReviewCard = ({ review }: { review: Review }) => {
        const fallback = review.author.substring(0, 2).toUpperCase();
        const avatarSrc = `https://placehold.co/100x100.png?text=${fallback}`;

        return (
            <Card className="flex flex-col w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
              <CardContent className="flex flex-col items-start text-left p-0 flex-grow gap-4">
                <div className="flex items-center gap-4 w-full">
                  <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarImage src={avatarSrc} data-ai-hint="user profile" />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{review.author}</h3>
                      {review.isVerified && <CheckCircle className="h-5 w-5 text-blue-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{review.time}</p>
                  </div>
                </div>
                <p className="text-foreground text-sm flex-grow">{review.text}</p>
                {review.reply && (
                  <div className="w-full pl-6 mt-4 border-l-2 border-primary/30">
                     <div className="flex items-start gap-3">
                        <CornerDownRight className="h-4 w-4 mt-1 text-primary/80 flex-shrink-0" />
                        <div className="flex-1">
                           <ReviewCard review={review.reply} />
                        </div>
                    </div>
                  </div>
                )}
                 <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">Responder</Button>
              </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Separator className="my-4 bg-primary/50" />
            <div className="py-8 space-y-8">
                {galleries.map((gallery) => (
                  <div key={gallery.id}>
                    <div className="w-full px-4 md:px-8">
                      <Carousel className="w-full" opts={{ loop: true }}>
                          <CarouselContent>
                              {gallery.photos.map((photo) => (
                                <CarouselItem key={photo.id} className="basis-full">
                                  <div className="p-1 space-y-2">
                                    <Card className="overflow-hidden border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                                      <CardContent className="flex aspect-[9/16] items-center justify-center p-0">
                                        <Image
                                            src={photo.src}
                                            alt={`Foto da galeria ${gallery.id + 1}`}
                                            width={400}
                                            height={800}
                                            className="w-full h-full object-cover"
                                            data-ai-hint={photo.hint}
                                          />
                                      </CardContent>
                                    </Card>
                                    <p className="text-center text-primary text-shadow-neon-red-light text-sm tracking-widest uppercase">
                                        {photo.word}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                          </CarouselContent>
                          <CarouselPrevious className="ml-14 bg-background/50 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                          <CarouselNext className="mr-14 bg-background/50 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                      </Carousel>
                    </div>
                    <Separator className="max-w-xl mx-auto my-8 bg-border/30" />
                  </div>
                ))}
            </div>
            
            <div className="px-4 md:px-8 py-12 bg-background flex flex-col items-center">
                <div className="text-center mb-12">
                    <p className="text-8xl font-bold text-primary text-shadow-neon-red-light">IS</p>
                </div>
            
                <div className="max-w-4xl w-full mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-shadow-neon-red">O que dizem sobre mim</h2>
                    <div className="flex flex-col items-center gap-6">
                      {reviews.map((review, index) => (
                        <ReviewCard key={index} review={review} />
                      ))}
                    </div>
                </div>
            </div>
            <SiteFooter />
        </>
    );
};

export default MainFooter;
