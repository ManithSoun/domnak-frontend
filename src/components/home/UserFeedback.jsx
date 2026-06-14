"use client";

import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sopheap Kem",
    role: "Homeowner in Phnom Penh",
    initials: "SK",
    rating: 5,
    quote: "Domnak saved me almost $4,000 on my villa construction. The cost breakdown pointed out exactly where my contractor marked up the materials beyond market rates. Essential tool!",
    date: "2 weeks ago"
  },
  {
    name: "Chantrea Vong",
    role: "Lead Architect, Vong Design",
    initials: "CV",
    rating: 5,
    quote: "Generating a BOQ used to take me hours of tedious work. Now I just upload the survey template, and I get an accurate starting layout sheet within minutes. My clients love the transparency.",
    date: "1 month ago"
  },
  {
    name: "Dara Oum",
    role: "Independent Contractor",
    initials: "DO",
    rating: 4,
    quote: "I use Domnak to verify my supplier prices. It keeps our bids competitive and builds trust with homeowners because we can show them real-time market data matching our quote.",
    date: "3 weeks ago"
  }
];

export default function UserFeedback() {
  return (
    <section id="feedback" className="bg-[#FAF7F0] py-16 sm:py-24 border-t border-[#b38e42]/10 relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#b38e42]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#80632b]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b38e42]/10 px-3 py-1 text-xs font-bold text-[#80632b] uppercase tracking-wider">
            <MessageSquare className="h-3.5 w-3.5" />
            User Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#201b12] tracking-tight">
            Trusted by Builders & <span className="text-[#b38e42] italic">Homeowners</span>
          </h2>
          <p className="text-sm sm:text-base text-[#201b12]/70 max-w-xl mx-auto">
            See how Domnak is bringing transparency, accuracy, and efficiency to Cambodian construction projects.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <Card key={idx} className="bg-white border border-[#b38e42]/15 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar size="default" className="border border-[#b38e42]/20">
                    {item.image && <AvatarImage src={item.image} alt={item.name} className="" />}
                    <AvatarFallback className="bg-[#b38e42]/10 text-[#80632b] font-bold">
                      {item.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-bold text-[#201b12]">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#201b12]/60">
                      {item.role}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Rating Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < item.rating
                          ? "fill-[#b38e42] text-[#b38e42]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex-grow">
                <p className="text-[#201b12]/80 text-xs sm:text-[13px] leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4 bg-[#fffdf9]/50 border-t border-[#b38e42]/10 p-4">
                <div className="w-full flex items-center justify-between text-xs text-[#201b12]/50">
                  <span>Verified User</span>
                  <span>{item.date}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Call To Action Button */}
        <div className="mt-16 text-center">
          <Separator className="bg-[#b38e42]/20 mb-8 max-w-xl mx-auto" />
          <div className="space-y-3">
            <p className="text-sm text-[#201b12]/70">
              Have you verified your project costs with Domnak?
            </p>
            <Button 
              className="rounded-full bg-[#b38e42] hover:bg-[#80632b] text-white px-8 py-4 font-bold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              Share Your Experience
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
