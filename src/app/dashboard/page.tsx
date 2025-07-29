
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, CheckCircle, BellRing, CreditCard, Lock, ArrowRight, Video, Star, PlayCircle, Mail, CornerDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  aiHint?: string;
}

const subscriptionVideos: Video[] = [
  { id: 'sub_vid_1', title: 'Tutorial Exclusivo de Shibari', thumbnailUrl: 'https://placehold.co/600x400.png', aiHint: 'rope art' },
  { id: 'sub_vid_2', title: 'Sessão Completa de Wax Play', thumbnailUrl: 'https://placehold.co/600x400.png', aiHint: 'candle wax' },
  { id: 'sub_vid_3', title: 'Introdução ao Findom', thumbnailUrl: 'https://placehold.co/600x400.png', aiHint: 'luxury money' },
  { id: 'sub_vid_4', title: 'Guia de Pet Play para Iniciantes', thumbnailUrl: 'https://placehold.co/600x400.png', aiHint: 'person collar' },
];

// Dados de exemplo para os vídeos comprados avulsos
const purchasedVideosExample: Video[] = [
    { id: 'pur_vid_1', title: 'Bastidores Exclusivos #1', thumbnailUrl: 'https://placehold.co/600x400.png', aiHint: 'backstage exclusive' },
    { id: 'pur_vid_2', title: 'Cena Deletada: O Encontro', thumbnailUrl: 'https://placehold.co/600x400.png', aiHint: 'deleted scene' },
]

const reviewsData = [
    { author: "Fisting SP", time: "2 dias", text: "Italo é um querido, educado, safado na medida, e fez uma das melhores sessões de fisting da minha vida. Sabe exatamente o que fazer, tem muita experiência. Lugar limpo e muito confortável. Já vou virar fixo." },
    { author: "AnonimoSpT", time: "2 semanas", text: "Vários brinquedos, sabe usa-los, sabe fistar e inicar um passivo. Muito putao e delicioso. Chupa um cu dando tesao. Sabe arrombar, \"piss inside\"...vou repetir" },
    { author: "Edu", time: "3 semanas", text: "Que delícia de carioca! Gosta do que faz, e faz com vontade. Fez tudo o que combinamos previamente, sem frescuras. Uma rola e bunda de outro planeta. Voltarei mais vezes, com certeza." },
    { author: "O Gato Puto", time: "3 semanas", text: "Que experiência sensacional! Um putão de confiança! Me deixou confortável e a vontade para ir me soltando e me fez de vadia exatamente como pedi! Sai com a bucetinha arrombada e leitada, me sentindo uma fêmea bem vadia" },
    { author: "Padre Hercilio", time: "3 semanas", text: "Sou padre da Igreja de verdade e não é segredo que os padres são tudo safado e eu tbm. Esse Italo me atraiu muito. Gostaria de abençoar ele com uma água benta especial: não aquela água benta comum, mas a água benta que vai jorrar do meu jato pau." },
    { author: "Mineiro em SP", time: "4 semanas", text: "Italo é um puta gostoso. Desde o olhar ate os pés. E o sotaque é um charme. Domina bem, manda na situação. Alargou meu cu até onde eu aguentei e depois ainda ficou uma hora metendo sem gozar. Eu teria ficado a noite toda com a pica dele fudendo meu rabo de tão bem que ele mete. Mas da próxima vez eu vou querer ir até onde ele não aguentar mais." },
    { author: "Luca", time: "1 mês", text: "Muito simpático e gosta de entender o que você quer, realmente domina e usa bem, ansioso pra próxima vez. Tem tantos brinquedos pra usar que até me surpreendi" },
    { author: "André", time: "2 meses", text: "Ainda vou ter a honra de me ajoelhar aos seus pés e agradecer por essa oportunidade" },
    { author: "Fan", time: "2 meses", text: "Curti cada instante desses 60 min. Ele é longo e gostoso. Também é educado, gentil, confiável, no pré e o no pós atendimento. Durante a foda, o senhor da situação e eu sua serva. Apanhei na bunda até chorar e pedir pra parar. Mamei muito a rola, levei mijão no cu, cuspe na boca e claro, muita rola e porra no cu no final. Gozei com ele chupando meus mamilos e dedando meu cuzinho. Um tesão e um prazer muito grande, que recomendo demais. Vocês não vão se arrepender!" },
    { author: "Manoel", time: "5 meses", text: "Italo é uma pessoa excepcional, sem erro. Tudo com ele vale a pena .... Um ativo com pegada mas também com envolvimento Tem pelo menos 5 anos que o conheço..." },
    { author: "Sub pc", time: "5 meses", text: "Foi uma foda incrível!!!! O melhor com que eu já saí! Com certeza irei em outras oportunidades" },
    { author: "Copa", time: "6 meses", text: "Valeu a pena conhecer . Atencioso e bem safado." },
    { author: "Bezerrando", time: "7 meses", text: "Esse é um gostoso que me desatina. O fisting, os brinquedos, a pele da pica roçando no meu cu ... fenomenal. Fora o leite que é uma delícia e vale cada gota. Recomendo." },
    { author: "Fabio", time: "10 meses", text: "Um cara super profissional, sabe realizar fetiches e também sabe ser carinhoso e educado. Sou tímido e ele me deixou super a vontade e confortável. Saí com ele algumas vezes e cada vez é melhor do que a outra. Se você quer um homem que te pegue de jeito mas que também sabe te dar carinho, o Italo é esse cara. Perfeito!!!" },
    { author: "👀", time: "10 meses", text: "Italo é uma pessoa maravilhosa e quando o assunto é fetiche é o único que conheci que realmente sabe fazer, além de ter um acervo de brinquedos sexuais deliciosos Quando ele nos surpreende é de ficar louco, tipo botar na coleira mandar ajoelhar e te levar até a porta pra receber o entregador do Zé delivery ou quando do nada ele te amarra todo e te leva ao delírio (claro se a pessoa gostar) vale Muito a pena" },
    { author: "Pedro", time: "11 meses", text: "O Italo foi maravilhoso, cumpriu tudo que combinamos. Ele é muito simpático, cheguei meio sem jeito, pois, queria experimentar alguns fetiches e ele fez com maestria, conduzindo a situação e me dominando. Quando percebi ele já estava todo dentro de mim. Super recomendo. Obrigado Cara. Bjão" },
    { author: "Lucas", time: "11 meses", text: "Um tesão. Cara bacana e gente fina. Com certeza 10/10." },
    { author: "passrj", time: "11 meses", text: "soube como conduzir um iniciante excelente atendimento recomendo a todos !" },
    { author: "Jota", time: "11 meses", text: "Hoje ganhei um mestre. Um homem apaixonante. Risco é esse: vc pode se apaixonar! Italo é tudo isso que disseram aí é tudo que não dá para descrever. Um macho com pegada e que beija como ninguém." },
    { author: "MARCOS PUTA", time: "11 meses", text: "Estou cheio de tesão pra fazer uma visita, e ter esse atendimento, de qualidade, que todos tiveram." },
    { author: "Renan", time: "11 meses", text: "De 0 a 10, a note é 11. EXCELENTE" },
    { author: "João", time: "0 anos", text: "Se você curte um bom fetiche e tem receio de realizar. Ítalo é o cara! Lindo pra caramba, cheiroso, pauzudo, metedor, calmo mas quando tem que forte, sabe te deixar maluco. Impressionado com ele e com certeza já virei assíduo. Se eu indico? 1000%! Impossível se arrepender.", reply: { author: "Italo Santos", text: "Você que é uma delícia 🤤", time: "0 anos" } },
    { author: "ADV", time: "1 ano", text: "Me fez de puta. Me deu um Pau amanhecido pra mamar. Eu queria mais, ele chamou um amigo e ambos revesaram meu rabo. O amigo alargava e ele metia. Quase pedi uma DP, mas faltou coragem. Da próxima eu quero!!!! Uma delícia de homem!!!!", reply: { author: "Italo Santos", text: "😛", time: "0 anos" } },
    { author: "Pedro", time: "1 ano", text: "Dominador sáfado na hora do sexo e muito simpático e atencioso antes e depois super recomendo", reply: { author: "Italo Santos", text: "Foi recíproco a simpatia né chefe", time: "1 ano" } },
    { author: "Robson", time: "1 ano", text: "Matei a saudade deste moreno delicioso. Além do ótimo bate-papo de sempre. Te gosto, meu lindo!", reply: { author: "Italo Santos", text: "Você que é uma delícia super simpático", time: "1 ano" } },
    { author: "Adriano", time: "1 ano", text: "O Ítalo é simplesmente o melhor garoto de programa que eu já fiquei. Além dele ser lindo, charmoso, gostoso, safado, putão e muito, mas muito bom de cama, ele é um ser humano sensacional. Cara bom de papo, inteligente, educado, honesto, simpático e extremamente gentil. Sou fã dele, pude realizar vários fetiches e só tive experiências maravilhosas. Super indico o trabalho dele." },
    { author: "Garoto novo", time: "1 ano", text: "Estive com ele, e foi sensacional. O beijo dele é maravilhoso, depois transamos intensamente." },
    { author: "Lucas", time: "1 ano", text: "Pessoa maravilhosa, paciente, delicioso excelente profissional, repetiria sempre" },
    { author: "Ricardo safado", time: "1 ano", text: "Estive com esse boy no final de semana passado, ele é incrível foi a minha primeira vez realizando fetiche, ele sabe o q está fazendo, foi muito atencioso e educado e dominador ao mesmo tempo . Ele tem uma pegada gostosa e uma rola grande e deliciosa" },
    { author: "Leo", time: "1 ano", text: "Um boy perfeito. Pra quem gosta de testar seus limites com fetiches é simplesmente o melhor que encontrei. Vale a pena cada investimento." },
    { author: "Novinho Goiânia", time: "1 ano", text: "O cara é o maior gostoso, me tratou como um príncipe, e sabe meter e levar ao delírio, super recomendo" },
    { author: "Anônimo", time: "1 ano", text: "Ótimo atendimento, muito gato e um ótimo dominador" },
    { author: "B", time: "1 ano", text: "Esse homem é surreal de gostoso, te deixa a vontade, ele te controla, mas ele entende o que vc quer… que delícia!!! Quero mais vezes…" },
    { author: "Ignacio", time: "1 ano", text: "Uma delícia. Educado e safado ao mesmo tempo. Pau gostoso e soca muito." },
    { author: "Sandro", time: "1 ano", text: "Ele é uma pessoa muito especial, muito paciente, educado e carinhoso, esteve comigo sem pressa, foi um momento inesquecível, me deixou todo doido kkkk" },
    { author: "Fã_BH", time: "2 anos", text: "Há dois meses estive com ele em BH. Hoje 05/12 me mandou msg e disse q estava aqui. Não perdi tempo. O que já tinha sido ótimo no primeiro encontro, agora foi excelente. Atendimento de primeira, prazeroso e cheio de tesao e dominação . Macho gostoso, dominador. Não erro mais! Vlw meu lindo." },
    { author: "Ivan", time: "2 anos", text: "Pessoa especial, alto astral, transmite alegria de viver e inspira adorável gostosura ? tesão de putaria com respeito e carinho e super profissional. Gosta do que faz. E tem um sorriso lindo e sedutor. Vida longa. Até breve ?" },
    { author: "Igorz", time: "2 anos", text: "Bom papo, gostoso, educado, macho! E que pegada! Quero mais vezes!" },
    { author: "BH", time: "2 anos", text: "Cara muito massa! Simpático pra caramba, extremamente gostoso. Não estava conseguindo dar pra ele, mas ele foi me deixando com tesao até conseguir meter até o fundo. Estou até agora sentindo. Espero que volte logo a BH." },
    { author: "Leo", time: "2 anos", text: "Excelente atendimento. Tudo perfeito, assim como as informações que estão no site. Fotos reais, macho, dominador se você quiser e também só um bom comedor se quiser apenas transar. Mas é um cara completo, um tesao. Atendimento único, sem correria, sem ser mecânico. Se é a sua primeira vez vai nele, se é a segunda ou terceira com boy, vai nele de novo por que o atendimento é diferenciado, é próprio." },
    { author: "Luis", time: "2 anos", text: "O Ítalo é ótimo, vale muito a pena. Quero mais." },
    { author: "Paulo", time: "2 anos", text: "perfeito.....carinhoso e violento......tudo na medida certa.. Quero mais." },
    { author: "Jose", time: "2 anos", text: "Perfeito.......Uma mistura de carinhoso e intenso." },
    { author: "Eu", time: "2 anos", text: "Não tenho nem palavras pra descrever esse homem brilhante, ele é simplesmente incrível e muito confiável e faz um sexo gostoso como ninguém,,muito atencioso, carinhoso e paciente. Ele é tudo de bom!!!!" },
    { author: "Lucas", time: "2 anos", text: "Lindo , muito simpático , me deixou super a vontade a ponto de eu não saber se queria conversar mais ou fuder mais !! E gosta mesmo de meter !!" },
    { author: "Fulano.", time: "2 anos", text: "Muito gostoso esse mlk, sou casado estava afim de sentir uma parada diferente e ele me surpreendeu. Quero de novo?" },
    { author: "Anonimo", time: "3 anos", text: "O Italo e sensacional. Alem de ser um cara muito gente boa e simpático, trocamos uma ideia maneira, ele tem um bom papo. E no sexo ele é um absurdo de gostoso, uma das melhores transas da minha vida! Me levou a loucura.", reply: { author: "Alex", text: "Ítalo é muito gostoso e te deixa a vontade. Realiza como ninguém suas fantasias. Ainda é super educado. Vale a pena.", time: "2 anos" } },
    { author: "K", time: "3 anos", text: "Sem comentários É um gostoso, educado e mete muito bem. Pauzudo! Gozei muitooooooooooooo" },
    { author: "Anônimo Mzh", time: "3 anos", text: "Cara gente fina, educado, com um pau muito gostoso e bem duro. Pica boa de sentar. Recomendo a todos." },
    { author: "Carlos - Niterói", time: "3 anos", text: "Bom! Hj fui conhecer o Dom Ítalo Ele é lindo, sorriso maroto, parece um modelo! Conversamos um pouco antes! Pois é a primeira vez, que experimento isso! Ele colocou um aparelho que dá choque no cú, deixou ele piscando o tempo todo! Depois colocou uns utensílios nas mãos e pés, me amordacou (tudo com meu consentimento), depois me comeu 2 vezes, até ele gozar! Que cara gostoso! Ele bj os meus mamilos e mordiscou-os, deixando extasiado! Quero-o de novo!" },
    { author: "@", time: "3 anos", text: "Acabei de sair do apto Ítalo. Ambiente limpo, de fácil acesso e o atendimento dele é ótimo! Foi minha primeira experiência com um fetichista e foi fantástico! Espero poder voltar!" },
    { author: "Robson", time: "3 anos", text: "Lindo, gostoso, tranquilo, muito gente boa, pegada inigualável. O Ítalo sabe o que faz! Apesar da pouca idade, é um doutos em matéria de dar prazer." },
    { author: "Francisco Rio de Janeiro", time: "3 anos", text: "O que eu mais gostei no Itálo foi tudo, rss. Realmente ele me recebeu muito bem, me deu o que eu queria, e incansável me fez sentir e ter uma experiência única ao lado dele.", reply: { author: "Gab", text: "Ele é muito simpático, gostoso e fode muito bem. Eu amei.", time: "2 anos" } },
    { author: "De outro estado", time: "3 anos", text: "Quando falei a primeira com o Ítalo eu pedi pra ele fazer uns fetiches bem loucos comigo. Fui até ele acreditando que ia ser como os outros que prometem e não cumprem...Ele cumpriu tudo o que combinamos e muito mais. O cara é fantástico! Super educado e simpático, mas sabe impor respeito na hora do sexo. Se eu morasse na mesma cidade com ele ia querer sair toda semana com ele hahaha. Ah, ele leva a segurança do cliente bem a sério e sabe respeitar seus limites. Recomendo pra caramba!" },
    { author: "Luiz", time: "3 anos", text: "Garoto e bom demais" },
    { author: "Putao bare", time: "3 anos", text: "Chupou meu cu demorado, meteu a mão na minha cuceta, me deu um mijada dentro e finalizou com um leitada dentro no pelo." },
    { author: "Ale", time: "3 anos", text: "Estive com ele semana passada, pedi uma sessão de cbt, com direito a chicote, vela quente e choque, tudo isso com as mãos e os pés algemados? cara, que tesão!" },
    { author: "Gabriel Castro", time: "3 anos", text: "Fui convidado para atender um cliente com Don Ítalo em São Paulo SP, me surpreendeu com o excelente atendimento, para quem procura humilhação, dominação o garoto está de parabéns, ainda não conheçi ninguém do nível dele. Satisfação garantida, conduz o atendimento sem ser mecânico e de qualidade." },
    { author: "Leh", time: "3 anos", text: "Ítalo super gente boa, bom de papo e atraente, foi a minha primeira experiência como Sub com ele e gostei demais, soube me dominar muito bem e meu muito prazer! Pra quem é iniciante como eu, super recomendo!!!" },
    { author: "Mineiro", time: "3 anos", text: "Já estive com Ítalo duas vezes. Além de saber brincar direitinho, ele tem um papo muito agradável. Domina muito bem e tem uma boa coleção de acessórios." },
    { author: "Branquinha", time: "3 anos", text: "Virei puta de vestidinho vagabundo. Apanhei como merecia. Levei porra na cara. Só fiz o que ele mandava. Gostei tanto de ser tratada assim que voltei e não queria ir embora. Me arregaçou. Domínio sedutor. Ítalo é daqueles personagens da literatura erótica e sdm. Nível internacional. Ele é escavador de desejos não ditos." },
    { author: "Putão", time: "3 anos", text: "Foda sensacional, já fiz várias sessões de dominação e putaria sem limites com Italo. Sabe dominar, humilhar, soca e fista até arrombar meu cu. Já me deu muita porra e mijo. Sem contar q ele tem todos os brinquedos e acessórios q eu podia imaginar. Até anaconda gigante ele enfiou em mim. Recomendo pra quem tem experiência e também pra quem quer ser iniciado, porque além de muito puto, ele é educado, limpo e seguro." },
    { author: "Rogfaria", time: "3 anos", text: "Se você gosta de ser tratado como puta, apanhar e tomar leite, esse é o cara! Macho, bonito, gostoso, educado e puto. Super recomendo!" },
    { author: "Gato bh 32a", time: "3 anos", text: "Lindo, educado, respeita os limites e sabe dominar. Não vejo a hora dele voltar pra BH pra servi-lo novamente. Bebi mijao, me vestiu de puta, usei coleirinha, algemas, me exibiu pro pessoal da República como sua putinha, fiz video. Tesão. Qro denovo hehehe. Saudades lindo." },
    { author: "Lu", time: "3 anos", text: "É bem difícil achar um garoto que conheça de verdade bdsm, mas o Ítalo é um mestre no assunto, sem falar que tem ótimos acessórios, e sabe muito bem usar, fiquei o tempo todo babando de tesão, valeu cada centavo...o bom é que no dia seguinte vai se olhar no espelho e lembrar...."},
    { author: "Diego-Florwsta-Bh-Rj", time: "4 anos", text: "Ele MOLEQUE melhor que nas fotos.e vídeos.... Melhor que.vc magina.. Recomemdo" },
    { author: "Luixx", time: "4 anos", text: "Sai com ele ontem, melhor de todos." },
    { author: "Cd 25a sp", time: "4 anos", text: "Encontrei Dom Ítalo no último sábado e nunca me senti tão humilhada na minha vida. Me tratou igual uma puta de verdade e arrombou bem minha cuceta. Sem falar que o pau dele é perfeito, o local é ótimo e os acessórios são excelentes para quem quer ficar cada vez mais largo" },
    { author: "F", time: "4 anos", text: "Demais o Ítalo!" },
    { author: "sub Jock", time: "4 anos", text: "O Ítalo é Perfeito e Inesquecível ! Não se iluda com a pouca idade dele, porque ele vai te surpreender. Pegada boa e perfeita, nem mais nem menos do que deveria ser e Faz com vontade. Impossível você ficar sem vontade de: quero mais." },
    { author: "Bebe", time: "4 anos", text: "Com esse cara realizei meu sonho de ser a passiva mais puta do mundo. Inesquecível." },
    { author: "Batman", time: "4 anos", text: "Melhor cara que já sai. Podem Ir sem medo, o cara vai sabe tratar um Viado do jeito que viado merece." },
    { author: "Anonimo", time: "4 anos", text: "O Ítalo é daquelas pessoas que deixa saudades. Super educado, safado, nada apressado, me fez gozar sem eu nem encostar no pau. Fala bastante putaria e domina muito bem. Isso sem falar nos inúmeros brinquedos que ele tem na casa dele" },
    { author: "Garoto safado", time: "4 anos", text: "Tesao de macho deve levar o puto a loucura. Eu queria ser obsecrados desse macho." },
    { author: "Pankado", time: "4 anos", text: "Sempre me oferece um adicional bom, pra puxar no pau. Chupa bem um cu, bomba bem e tem brinquedos gostosos. Tá sempre f1 e gosta do que faz. Nota 10." },
    { author: "Trabalha em ipanema", time: "5 anos", text: "Piroca gostosa , baste leite soca gostoso e carinhoso .Quando posso vou sempre fude com ele pica muito gostosa" },
    { author: "Italo", time: "5 anos", text: "leito farto" },
    { author: "Rodrigo", time: "5 anos", text: "Que pau gostoso de mamar. Eh grande mesmo. E jorra bem." },
];

export default function AssinantePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [purchasedVideos, setPurchasedVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('usuario@exemplo.com');
  
  useEffect(() => {
    setIsClient(true);
    // Simula a verificação do status da assinatura e busca o email do cliente
    if (localStorage.getItem('hasSubscription') === 'true' || localStorage.getItem('hasPaid') === 'true') {
        setHasSubscription(true);
        const savedEmail = localStorage.getItem('customerEmail');
        if (savedEmail) {
            setCustomerEmail(savedEmail);
        }
    }
  }, []);

  useEffect(() => {
    const fetchPurchasedVideos = async () => {
      // Busca os vídeos vendidos avulsos
      setIsLoadingVideos(true);
      try {
        const videosCollection = collection(db, "videos");
        const q = query(videosCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            // Se não houver vídeos reais, usa os de exemplo
            setPurchasedVideos(purchasedVideosExample);
        } else {
            const videosList = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Video));
            setPurchasedVideos(videosList);
        }
      } catch (error) {
        console.error("Error fetching videos: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar vídeos comprados.",
        });
        // Em caso de erro, usa os vídeos de exemplo
        setPurchasedVideos(purchasedVideosExample);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    if (isClient) {
      fetchPurchasedVideos();
    }
  }, [isClient, toast]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasPaid');
      localStorage.removeItem('hasSubscription');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('redirectAfterLogin');
      localStorage.removeItem('customerEmail');
    }
    router.push('/');
  };
  
  const ReviewCard = ({ review }: { review: typeof reviewsData[0] }) => {
    const fallback = review.author.substring(0, 2).toUpperCase();
    const avatarSrc = `https://placehold.co/100x100.png?text=${fallback}`;

    return (
        <Card className="flex flex-col w-full p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
          <CardContent className="flex flex-col items-start text-left p-0 flex-grow gap-4">
            <div className="flex items-center gap-4 w-full">
              <Avatar className="w-12 h-12 border-2 border-primary">
                <AvatarImage src={avatarSrc} data-ai-hint="user profile" />
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{review.author}</h3>
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
                       <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{review.reply.author}</h4>
                            <CheckCircle className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">{review.reply.time}</p>
                       <p className="text-foreground text-sm mt-2">{review.reply.text}</p>
                    </div>
                </div>
              </div>
            )}
             <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">Responder</Button>
          </CardContent>
        </Card>
    );
  }

  const UserProfileCard = () => (
     <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
             <Avatar className="h-20 w-20 border-2 border-primary/50">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar do Usuário" data-ai-hint="profile avatar" />
              <AvatarFallback className="text-3xl bg-muted">U</AvatarFallback>
            </Avatar>
          </div>
           <CardTitle className="text-3xl text-shadow-neon-red-light">
                Bem-vindo(a)!
            </CardTitle>
          <CardDescription>Painel do Assinante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-primary" />
                <p><span className="text-muted-foreground">Status: </span><strong>Verificado</strong></p>
            </div>
            <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" />
                <p><span className="text-muted-foreground">Email: </span><strong>{customerEmail}</strong></p>
            </div>
        </CardContent>
        <CardFooter>
             <Button className="w-full h-11 text-base" variant="secondary" onClick={handleLogout}>
                <LogOut className="mr-2" />
                Sair
            </Button>
        </CardFooter>
      </Card>
  );
  
  const VideoGrid = ({ videos, onVideoClick }: { videos: Video[], onVideoClick: (id: string) => void}) => (
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map(video => (
            <button key={video.id} className="relative group overflow-hidden rounded-lg border border-primary/20 text-left" onClick={() => onVideoClick(video.id)}>
                <Image src={video.thumbnailUrl} alt={video.title} width={300} height={169} className="object-cover w-full aspect-video transition-transform duration-300 group-hover:scale-105" data-ai-hint={video.aiHint || 'video content'}/>
                 <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-12 w-12 text-white mb-2"/>
                    <h3 className="font-bold text-white line-clamp-2">{video.title}</h3>
                </div>
            </button>
        ))}
    </div>
  );

  const SubscriptionSection = () => (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="text-2xl text-shadow-neon-red-light flex items-center gap-2"><Star /> Vídeos da Assinatura</CardTitle>
            <CardDescription>Conteúdo exclusivo liberado para assinantes.</CardDescription>
        </CardHeader>
        <CardContent>
             {hasSubscription ? (
                <VideoGrid videos={subscriptionVideos} onVideoClick={(id) => router.push(`/assinante/videos?id=${id}`)} />
            ) : (
                <div className="text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
                    <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Assinatura Inativa</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Assine para ter acesso a tutoriais e vídeos exclusivos.
                    </p>
                    <Button className="mt-4 h-11 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={() => router.push('/')}>
                        <CreditCard className="mr-2" />
                        Assinar Agora
                    </Button>
                </div>
            )}
        </CardContent>
    </Card>
  );

  const PurchasedVideosSection = () => (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="text-2xl text-shadow-neon-red-light flex items-center gap-2"><Video /> Vídeos Comprados Avulsos</CardTitle>
            <CardDescription>Acesse aqui os vídeos que você comprou na loja.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingVideos ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : purchasedVideos.length > 0 ? (
                <VideoGrid videos={purchasedVideos} onVideoClick={(id) => router.push(`/assinante/videos?id=${id}`)} />
            ) : (
                 <div className="text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground">Você ainda não comprou nenhum vídeo avulso.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );

  if (!isClient) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-start p-4 bg-background gap-8">
       <div className="w-full max-w-4xl space-y-8">
            <UserProfileCard />
            <SubscriptionSection />
            <PurchasedVideosSection />

            <Separator className="my-8 bg-primary/20" />
            
            <div className="w-full">
                <h2 className="text-3xl font-bold text-center mb-8 text-shadow-neon-red">Comentários</h2>
                <div className="flex flex-col items-center gap-6">
                    {reviewsData.map((review, index) => (
                        <ReviewCard key={index} review={review} />
                    ))}
                </div>
            </div>
       </div>
    </main>
  );
}

    