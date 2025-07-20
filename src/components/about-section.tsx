
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

export default function AboutSection() {
    return (
        <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl my-8">
            <CardHeader>
                <CardTitle className="text-6xl text-primary text-shadow-neon-red-light text-center uppercase">
                    SOBRE
                </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-base space-y-6">
                <div>
                    <h3 className="font-semibold text-primary/90 mb-2 text-2xl text-center">Características Físicas</h3>
                    <p>1,69m de altura e 70kg com cabelo castanho claro corpo atlético magro definido um dote de 20cm.</p>
                    <p>Fetichista elite. Costumo dizer isso pois para meus servos o cachê que pagam indiferente em suas vidas.</p>
                    <p>Independentemente do status social trato todos igualmente mesmo aqueles que só possam ter o prazer de desfrutar da minha companhia uma vez ao mês.</p>
                    <p>Sou cordial e autoritário, o acompanhante ideal para te iniciar em suas maiores fantasias sexuais.</p>
                </div>

                <div>
                    <h3 className="font-semibold text-primary/90 mb-2 text-2xl text-center">Durante as sessões</h3>
                    <p>Gosto de proporcionar experiências únicas libertando os desejos mais obscuros e reprimidos. Realizo vários fetichessendo minhas práticas com mais experiência: D/s, fisting, pet-play, pissing, spit, leather, anal play, nipple play, ass play, spanking, humilhação, CBT, wax, sissificação, e-stim, bondage, asfixia. Disponho de acessórios e brinquedos para aquecer a relação.</p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-primary/90 italic">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <p className="text-center">Para aqueles que não têm fantasias e fetiches, podemos ter uma relação sexual normal sem práticas.</p>
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <p className="mt-2">Tudo à disposição em um ambiente climatizado, seguro e confortável, com chuveiro quente, toalha limpa, sabonete, álcool gel, camisinha e lubrificante. Contrate-me no WhatsApp e me encontre aqui no meu local.</p>
                </div>
            </CardContent>
        </Card>
    );
}
