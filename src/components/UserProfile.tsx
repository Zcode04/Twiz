'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Camera, MessageCircle, UserPlus, UserMinus, Star, Award, Zap, Heart, Share, MoreHorizontal } from 'lucide-react';

const UserProfile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  // مجموعة من الصور الافتراضية للملف الشخصي
  const avatarOptions = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face", 
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face"
  ];

  // بيانات المستخدم
  const userData = {
    name: "مرحبًا بكم في منصة تويزه",
    username: "@kanai",
    bio: "⚠️ تنبيه: هذا التطبيق لا يزال قيد التطوير. قد تلاحظ أن بعض الواجهات أو الميزات لم تكتمل بعد أو لا تعمل بالشكل المتوقع. نعمل باستمرار على تحسين التجربة، ونقدّر تفهمكم وصبركم ❤️",
    
    
    followers: 12500,
    following: 890,
    projects: 47,
    skills: ["React", "Next.js", "Figma", "TypeScript"],
    achievements: 15,
    rating: 4.9
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const changeAvatar = () => {
    setCurrentAvatarIndex((prevIndex) => 
      (prevIndex + 1) % avatarOptions.length
    );
  };



  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-md mx-auto">
        {/* البطاقة الرئيسية بتصميم مبتكر */}
        <div className="relative">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            {/* الهيدر العلوي */}
        

            {/* القسم الرئيسي للملف الشخصي */}
            <div className="text-center mb-8">
              {/* صورة الملف الشخصي مع تأثيرات مبتكرة */}
              <div className="relative inline-block mb-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-green-600 to-blue-600 rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative">
                  <img
                    src={avatarOptions[currentAvatarIndex]}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white/30"
                  />
                  


                  
                  {/* زر تغيير الصورة */}
                  <button
                    onClick={changeAvatar}
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                  >
                    <Camera className="w-3 h-3" />
                  </button>

                  {/* الشارات المبتكرة */}
                
                  
                  {/* مؤشر الحالة */}
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white/50 animate-pulse"></div>
                </div>
              </div>

              {/* معلومات المستخدم */}
              <h1 className="text-2xl font-bold text-white mb-1">{userData.name}</h1>
              <p className="text-purple-200 text-sm mb-3">{userData.username}</p>
              <p className="text-white/80 text-sm leading-relaxed mb-4 px-2">{userData.bio}</p>

              {/* شريط التقدم والمستوى */}
         

              {/* إحصائيات بتصميم مبتكر */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <div className="text-lg font-bold text-white">{userData.projects}</div>
                  <div className="text-xs text-purple-200">مشاريع</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <div className="text-lg font-bold text-white">{(userData.followers / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-purple-200">متابع</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <div className="text-lg font-bold text-white">{userData.rating}</div>
                  <div className="text-xs text-purple-200 flex items-center justify-center">
                    <Star className="w-3 h-3 fill-current mr-1" />
                    تقييم
                  </div>
                </div>
              </div>

              {/* أزرار العمل */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={handleFollowToggle}
                  className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                    isFollowing
                      ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 inline mr-2" />
                      إلغاء المتابعة
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      متابعة
                    </>
                  )}
                </button>
                
                <Link href="/messages">
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </Link>
                
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

            
            </div>
          </div>
        </div>

        {/* بطاقات إضافية مبتكرة */}
        <div className="mt-6 space-y-4">
          {/* بطاقة النشاط الأخير */}


          {/* بطاقة الإحصائيات السريعة */}
          <div className="grid grid-cols-2 gap-4">
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;