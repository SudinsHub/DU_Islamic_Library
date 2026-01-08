import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Award, Clock, CheckCircle, Star, Sparkles } from 'lucide-react';

const ArabicCoursePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: <BookOpen className="w-6 h-6" />, title: "২০ টি ক্লাস", desc: "সম্পূর্ণ কোর্স" },
    { icon: <Calendar className="w-6 h-6" />, title: "২৫ জানুয়ারি", desc: "কোর্স শুরু" },
    { icon: <Users className="w-6 h-6" />, title: "সব বয়সের জন্য", desc: "ছাত্র থেকে বৃদ্ধ" },
    { icon: <Award className="w-6 h-6" />, title: "বিশেষ পুরস্কার", desc: "সেরা শিক্ষার্থীর জন্য" }
  ];

  const syllabus = [
    { class: "১-৩", topic: "হরফের উচ্চারণ ও আকৃতি", date: "২৪, ২৬, ২৮ জানুয়ারি" },
    { class: "৪", topic: "হারাকতের পরিচিতি ও ব্যবহার", date: "৩১ জানুয়ারি" },
    { class: "৫", topic: "হারাকাতের সাহায্যে শব্দগঠন", date: "২ ফেব্রুয়ারি" },
    { class: "৬", topic: "সাকিন ও তাশদীদ", date: "৪ ফেব্রুয়ারি" },
    { class: "৭", topic: "ক্বলাক্বলার হরফ ও তানবীন", date: "৭ ফেব্রুয়ারি" },
    { class: "৮", topic: "মাদ্দে আসলি ও ওয়াক্বফ", date: "৯ ফেব্রুয়ারি" },
    { class: "৯", topic: "৩ আলিফ মদ", date: "১১ ফেব্রুয়ারি" },
    { class: "১০", topic: "৪ আলিফ মদ", date: "১৪ ফেব্রুয়ারি" },
    { class: "১১", topic: "নুন সাকিন ও তানবীন বিস্তারিত", date: "১৬ ফেব্রুয়ারি" },
    { class: "১২", topic: "মিম সাকিনের গুন্নাহনীতি", date: "১৮ ফেব্রুয়ারি" },
    { class: "১৩-২০", topic: "কুরআনে প্র্যাক্টিক্যাল প্রয়োগ", date: "রমজানে" }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Islamic Pattern Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="20" fill="none" stroke="#0CCE6B" strokeWidth="1"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#0CCE6B" strokeWidth="0.5"/>
              <path d="M 40 10 L 40 70 M 10 40 L 70 40" stroke="#0CCE6B" strokeWidth="0.5"/>
              <path d="M 20 20 L 60 60 M 20 60 L 60 20" stroke="#0CCE6B" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
        </svg>
      </div>

      {/* Floating Decorative Elements */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse" 
           style={{ transform: `translateY(${scrollY * 0.2}px)` }}/>
      <div className="fixed bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-full blur-3xl animate-pulse" 
           style={{ transform: `translateY(${-scrollY * 0.15}px)` }}/>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className={`bg-gradient-to-br from-emerald-50 via-white to-green-50 pt-12 pb-20 px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-lg mb-6 border border-emerald-100">
              <Sparkles className="w-4 h-4 text-[#0CCE6B]" />
              <span className="text-sm font-semibold text-gray-700">রমাদান স্পেশাল কোর্স</span>
            </div>

            {/* Organizer */}
            <div className="mb-6">
              <div className="inline-block bg-gradient-to-r from-[#0CCE6B] to-emerald-600 text-white px-8 py-3 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
                <p className="text-lg font-bold">ঢাকা বিশ্ববিদ্যালয় দাওয়াহ সার্কেল</p>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-green-600 to-[#0CCE6B] bg-clip-text text-transparent leading-tight">
              কুরআন তাজবিদ<br/>প্রশিক্ষণ কোর্স
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              মাত্র <span className="font-bold text-[#0CCE6B]">১২ টি ক্লাসে</span> তাজবিদ ও শুদ্ধ উচ্চারণের বেসিক শিখুন, অতঃপর কুরআনের সূরা মাশক করুন
            </p>

            {/* CTA Section */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
              {/* CTA Button */}
              <button onClick={() => window.open('https://forms.gle/3CHmaWXSqqgXGuq1A', '_blank')} className="group bg-gradient-to-r from-[#0CCE6B] to-emerald-600 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-110 transition-all duration-300">
                <span className="flex items-center gap-3">
                  রেজিষ্ট্রেশন করুন
                </span>
              </button>

              {/* Price Badge */}
              <div className="inline-block bg-white px-8 py-4 rounded-2xl shadow-xl border-2 border-[#0CCE6B]">
                <p className="text-gray-600 text-md mb-1">ফি</p>
                <p className="text-4xl font-bold text-[#0CCE6B]">১০০ টাকা</p>
                <p className="text-xs text-gray-500 mt-2">৯৫% উপস্থিতিতে সম্পূর্ণ ফেরত</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-4 -mt-10 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} 
                   className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                   style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="bg-gradient-to-br from-[#0CCE6B]/10 to-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto text-[#0CCE6B]">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-1 text-center">{feature.title}</h3>
                <p className="text-sm text-gray-600 text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Course Details */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-100">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-emerald-600 to-[#0CCE6B] bg-clip-text text-transparent">
              কোর্স সম্পর্কে
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p className="text-lg">
                ঢাকা বিশ্ববিদ্যালয় দাওয়াহ সার্কেল আসন্ন রমজানকে সামনে রেখে <span className="font-semibold text-[#0CCE6B]">সব বয়সের পুরুষদের</span> (ছাত্র, শিক্ষক, চাকরিজীবী, বেকার, বৃদ্ধ) জন্য আয়োজন করতে যাচ্ছে "কুরআন তাজবিদ প্রশিক্ষণ অনলাইন কোর্স"।
              </p>
              <div className="bg-white p-6 rounded-2xl border-l-4 border-[#0CCE6B] shadow-md">
                <p className="font-semibold text-xl text-gray-800">
                  মাত্র ১২ টি ক্লাসেই তাজবিদ তথা আরবি শুদ্ধ উচ্চারণের বেসিক ক্লিয়ার করে দেওয়া হবে ইনশাআল্লাহ।
                </p>
              </div>
              <p>
                অর্থাৎ ১২ টি ক্লাস মনোযোগ সহকারে করলে ইনশাআল্লাহ শুদ্ধ উচ্চারণ অনেকটাই রপ্ত করে ফেলা যাবে। এরপর কুরআনের কয়েকটি সূরা মাশক করানো হবে।
              </p>
            </div>
          </div>
        </div>

        {/* Syllabus Section */}
        <div className="max-w-5xl mx-auto px-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-600 to-[#0CCE6B] bg-clip-text text-transparent">
            কোর্স সিলেবাস
          </h2>
          <div className="space-y-4">
            {syllabus.map((item, idx) => (
              <div key={idx} 
                   className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-[#0CCE6B] transform hover:-translate-x-2">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-[#0CCE6B] to-emerald-600 text-white font-bold px-4 py-2 rounded-xl min-w-[60px] text-center shadow-lg">
                    ক্লাস {item.class}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{item.topic}</h3>
                    {/* <p className="text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0CCE6B]" />
                      {item.date}
                    </p> */}
                  </div>
                  <CheckCircle className="w-6 h-6 text-[#0CCE6B] opacity-70" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Features */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-amber-200">
            <h2 className="text-3xl font-bold mb-6 text-center text-amber-900 flex items-center justify-center gap-3">
              <Award className="w-8 h-8" />
              বিশেষ সুবিধা
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-md flex items-start gap-4">
                <div className="bg-[#0CCE6B] text-white p-3 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">টাকা ফেরত গ্যারান্টি</h3>
                  <p className="text-gray-700">কমপক্ষে ৯৫% উপস্থিতি থাকলে সম্পূর্ণ টাকা ফেরত পাবেন</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md flex items-start gap-4">
                <div className="bg-amber-500 text-white p-3 rounded-full">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">বিশেষ পুরস্কার</h3>
                  <p className="text-gray-700">কোর্স শেষে ইভ্যালুয়েশন টেস্টে প্রথম স্থান অধিকারীর জন্য বিশেষ পুরস্কার</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Library Promotion Section */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-emerald-200">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-[#0CCE6B] bg-clip-text text-transparent">
                আমাদের ইসলামিক লাইব্রেরি পরিদর্শন করুন
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
                এই কোর্সের মাধ্যমে আপনার জ্ঞান শুরু করুন এবং আমাদের বিশাল ইসলামিক লাইব্রেরিতে হাজারো বই, প্রকাশনা এবং সম্পদ আবিষ্কার করুন। কুরআন, হাদিস, ফিক্হ এবং আরও অনেক কিছু পাবেন এক জায়গায়।
              </p>
              <a href="/" className="inline-block bg-gradient-to-r from-[#0CCE6B] to-emerald-600 text-white px-12 py-5 rounded-sm text-xl font-bold shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-110 transition-all duration-300">
                ঘুরে আসুন ঢাকা বিশ্ববিদ্যালয় ইসলামিক লাইব্রেরি থেকে
              </a>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-[#0CCE6B] via-emerald-600 to-green-700 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              এখনই যোগ দিন এবং কুরআন শুদ্ধভাবে পড়তে শিখুন
            </h2>
            <p className="text-white/90 text-lg mb-8">
              "যে ব্যক্তি কুরআন তিলাওয়াত করে এবং তা অনুশীলনে দক্ষ, সে থাকবে সম্মানিত ফেরেশতাদের সঙ্গে; আর যে কষ্ট করে তিলাওয়াত করে (তাজবিদ শিখে, শব্দ ঠিক করতে চেষ্টাশীল থাকে), তার জন্য দ্বিগুণ সওয়াব।"
               — সহীহ বুখারী ৪৯৩৭, সহীহ মুসলিম ৭৯৮
            </p>
            <button onClick={() => window.open('https://forms.gle/3CHmaWXSqqgXGuq1A', '_blank')} className="bg-white text-[#0CCE6B] px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-white/50 transform hover:scale-110 transition-all duration-300">
              রেজিষ্ট্রেশন করুন
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white py-8 px-4 text-center">
          <p className="text-lg font-semibold mb-2">ঢাকা বিশ্ববিদ্যালয় দাওয়াহ সার্কেল</p>
          <p className="text-gray-400">কুরআন তাজবিদ প্রশিক্ষণ কোর্স ২০২৬</p>
        </div>
      </div>
    </div>
  );
};

export default ArabicCoursePage;