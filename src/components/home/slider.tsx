"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SliderProps {
  slides: {
    id: number;
    images: string;
    title: string;
  }[];
}

export function Slider({ slides }: SliderProps) {
  if (!slides?.length) return null;

  return (
    <div className="mx-auto w-full">
      <Carousel
        opts={{
          loop: true,
        }}
        className="relative"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
  <div className="relative w-full overflow-hidden rounded-2xl">
    <Image
      src={slide.images}
      alt={slide.title}
      width={1200}
      height={600}
      priority
      className="w-full h-auto object-contain"
    />
  </div>
</CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-3 bg-background/80 hover:bg-background" />
        <CarouselNext className="right-3 bg-background/80 hover:bg-background" />
      </Carousel>
    </div>
  );
}