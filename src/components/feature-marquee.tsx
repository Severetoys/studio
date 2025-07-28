
"use client";

import { CheckCircle } from 'lucide-react';

const features = [
    "Atualizações semanais com novas produções.",
    "Comunidade e interação direta.",
    "Conteúdo exclusivo e sem censura.",
    "Acesso a vídeos e ensaios completos.",
];

const FeatureMarquee = () => (
    <div className="relative w-full overflow-hidden bg-black py-4 mt-8">
        <div className="flex animate-marquee whitespace-nowrap">
            {features.map((feature, index) => (
                <span key={index} className="flex items-center mx-4 text-gray-400 text-lg">
                    <CheckCircle className="h-5 w-5 mr-3 text-red-500" />
                    {feature}
                </span>
            ))}
            {features.map((feature, index) => (
                 <span key={`dup-${index}`} className="flex items-center mx-4 text-gray-400 text-lg" aria-hidden="true">
                    <CheckCircle className="h-5 w-5 mr-3 text-red-500" />
                    {feature}
                </span>
            ))}
        </div>
    </div>
);

export default FeatureMarquee;
