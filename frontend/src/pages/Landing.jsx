"use client"

import { BookOpen, Shield, Users, CheckCircle2 } from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import {useNavigate} from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate();
    const handleBrowseBooks = (e) => {
      e.preventDefault();
      navigate(`/browse-books`);
    };
  const steps = [
    { title: "নিবন্ধন করুন", description: "আপনার তথ্য দিয়ে লাইব্রেরিতে নিবন্ধিত হন" },
    { title: "বই অনুরোধ করুন", description: "আপনার পছন্দের বই খুঁজুন এবং অনুরোধ করুন" },
    { title: "হল থেকে সংগ্রহ করুন", description: "আপনার হলের লাইব্রেরি থেকে বই সংগ্রহ করুন" },
  ]

  const features = [
    { icon: BookOpen, title: "বিস্তৃত সংগ্রহ", description: "ইসলামিক জ্ঞান, শিক্ষা এবং সংস্কৃতির বিস্তৃত সংগ্রহ" },
    { icon: Shield, title: "নিরাপদ পরিবেশ", description: "সম্পূর্ণ শরীয়তসম্মত এবং আরামদায়ক পরিবেশ" },
    { icon: Users, title: "সক্রিয় সম্প্রদায়", description: "ঢাকা বিশ্ববিদ্যালয়ের হাজার হাজার সক্রিয় শিক্ষার্থী" },
  ]

  return (
    <main className="w-full overflow-hidden">
      {/* 🌿 HERO SECTION */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      <BackgroundBeams/>

        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 bg-[#0CCE6B] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 bg-[#0CCE6B] blur-3xl"></div>
        </div>

        {/* 🌸 ABOUT SECTION */}
        <section className="w-full py-12 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-bangla text-4xl sm:text-5xl text-green-800 mb-4">
                ঢাকা বিশ্ববিদ্যালয় ইসলামিক লাইব্রেরি
              </h2>
            </div>
          {/* Quranic Verse */}
          <h3 className="space-y-4 text-center">
            <TextGenerateEffect
              words="যারা জানে এবং যারা জানে না, তারা কি সমান?"
              className="font-bangla  md:text-8xl lg:text-9xl text-gray-900 leading-tight"
            />
            <p className="font-bangla text-lg text-[#0CCE6B] font-medium">
              সূরা যুমার, আয়াত: ৯
            </p>
          </h3>

          {/* Divider */}
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#0CCE6B] to-transparent"></div>
          </div>

          {/* CTA Button */}
          <div className="p-8 flex justify-center">
            <button className="px-10 py-3 bg-[#0CCE6B] z-10 text-white rounded-full font-bangla text-2xl hover:bg-[#0ab857] transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={handleBrowseBooks}
            >
              বইগুলো দেখুন
            </button>
          </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-14">
              {[
                { number: "২০২০", text: "থেকে লাইব্রেরি চলমান" },
                { number: "৯", text: "হলে লাইব্রেরি পরিচালিত হয়" },
                { number: "৩০০+", text: "বই প্রতি মাসে পড়া হয়" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3 sm:p-6 border border-gray-300 hover:shadow-lg transition"
                >
                  <div className="text-2xl sm:text-5xl text-[#0CCE6B] mb-3 font-bangla">{stat.number}</div>
                  <p className="font-bangla text-gray-700 text-sm sm:text-lg">{stat.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-10 border border-[#0CCE6B]/30 text-center">
              <div className="bg-[#0CCE6B]/15 rounded-lg py-5">
                <p className="font-bangla text-gray-800 text-3xl">
                  ✓ সম্পূর্ণ ফ্রি মিক্সিং মুক্ত
                </p>
                <p className="font-bangla text-gray-700 mt-2 text-2xl">
                  পুরো প্রক্রিয়ায় বিপরীত লিঙ্গের কারো সঙ্গে যোগাযোগের প্রয়োজন নেই
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 px-6 max-w-5xl mx-auto text-center py-10 sm:py-8">
          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-2 mt-10">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-md hover:shadow-xl transition-shadow border border-[#0CCE6B]/20"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#0CCE6B] to-[#0ab857] mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bangla text-md sm:text-xl text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-bangla text-gray-700 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>



      {/* 📚 STEPS SECTION */}
      <section className="w-full py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-bangla text-4xl sm:text-5xl text-gray-900 mb-3">
              তিনটি সহজ ধাপে বই সংগ্রহ করুন
            </h2>
            <p className="font-bangla text-gray-600 text-2xl">
              বই পড়া এখন আরও সহজ এবং সুবিধাজনক
            </p>
          </div>

          <div className="space-y-10 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-5 relative">

                {/* Step number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0CCE6B] to-[#0ab857] flex items-center justify-center text-white font-bangla text-lg shadow-lg z-10">
                  {index + 1}
                </div>

                {/* Step content */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-[#0CCE6B]/30 hover:border-[#0CCE6B] transition-all duration-300 hover:shadow-lg flex-1">
                  <h3 className="font-bangla text-2xl text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="font-bangla text-gray-700 text-lg ">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌿 FOOTER */}
      <footer className="w-full bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10 text-center space-y-6">
          <div>
            <p className="font-bangla text-gray-700 text-2xl font-semibold">বাস্তবায়নে:</p>
            <p className="text-[#0CCE6B] font-bangla text-2xl">
              ঢাকা বিশ্ববিদ্যালয় দাওয়াহ সার্কেল
            </p>
          </div>

        </div>
      </footer>
    </main>
  )
}
