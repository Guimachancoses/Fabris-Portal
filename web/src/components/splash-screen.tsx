"use client";

import { useEffect } from "react";
import Image from "next/image";
import { animate } from "animejs";

export default function SplashScreen({ finishLoading }: {
    finishLoading: () => void;
}) {

    useEffect(() => {
        animate(
            "#logo",
            {
                scale: [{ from: 0, to: 1.25 }],
                opacity: [{ from: 0, to: 1 }],
                duration: 900,
                ease: "easeInOutExpo",
            },
        );
    }, []);


    return (
        <div className="flex h-screen items-center justify-center">
            <Image id="logo" src="/logo-fabrispuma.svg" alt="" width={220} height={220} />
        </div>
    );
}
