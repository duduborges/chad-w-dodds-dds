"use client";

import {
  LuSmile,
  LuStar,
  LuPhone,
  LuMapPin,
  LuClock,
  LuChevronRight,
  LuUser,
  LuShieldCheck,
  LuSparkles,
  LuHeart,
  LuScanLine,
  LuCrown,
  LuZap,
  LuSyringe,
  LuCalendar,
  LuMail,
  LuMessageCircle,
  LuQuote,
  LuStethoscope,
} from "react-icons/lu";
import { FaFacebookF } from "react-icons/fa";
import BookingForm from "@/components/BookingForm";
import InsuranceSection from "@/components/InsuranceSection";

/* ─── Clinic Data ─── */
const CLINIC = {
  name: "Chad W. Dodds D.D.S.",
  specialty: "General and Cosmetic Dentistry",
  address: "1415 Fillmore St, Suite 700, Twin Falls, ID 83301",
  phone: "(208) 733-5814",
  phoneTel: "+12087335814",
  email: "contact@chaddoddsdental.com",
  rating: 4.9,
  reviewsCount: 138,
  googleMapsUrl:
    "https://www.google.com/maps/search/Chad+W+Dodds+DDS+1415+Fillmore+St+Twin+Falls+Idaho",
  facebookUrl: "https://www.facebook.com/magicvalleydentists/",
  dentist: "Dr. Chad W. Dodds",
  city: "Twin Falls",
  hours: [
    { day: "Monday", time: "8:00 AM - 5:00 PM" },
    { day: "Tuesday", time: "8:00 AM - 5:00 PM" },
    { day: "Wednesday", time: "8:00 AM - 5:00 PM" },
    { day: "Thursday", time: "8:00 AM - 5:00 PM" },
    { day: "Friday", time: "Closed" },
    { day: "Saturday", time: "Closed" },
    { day: "Sunday", time: "Closed" },
  ],
};

const SERVICES = [
  { name: "Dental Exams", icon: LuScanLine, desc: "Comprehensive oral evaluations" },
  { name: "Cleanings", icon: LuSparkles, desc: "Professional teeth cleaning" },
  { name: "Cosmetic Dentistry", icon: LuSmile, desc: "Smile makeovers & veneers" },
  { name: "Teeth Whitening", icon: LuZap, desc: "Professional whitening treatments" },
  { name: "Crowns & Bridges", icon: LuCrown, desc: "Custom restorations" },
  { name: "Root Canal Therapy", icon: LuSyringe, desc: "Pain-free endodontics" },
  { name: "Implant Restoration", icon: LuShieldCheck, desc: "Permanent tooth replacement" },
  { name: "Emergency Care", icon: LuHeart, desc: "Same-day urgent dental care" },
];

const REVIEWS = [
  {
    text: "Dr. Dodds is one of the most thorough and considerate dentists I have ever been to. He is a perfectionist and explains everything in a professional and friendly manner. He never up-sells unnecessary procedures and is always on time.",
    reviewer: "Healthgrades Patient",
  },
  {
    text: "After a horrible experience with another dental practice in town, I went back to my childhood dentist, Dr. Dodds. He is so caring, has a great way of listening and explaining options, and is prompt!",
    reviewer: "Healthgrades Patient",
  },
  {
    text: "There just is not enough praise for Dr. Dodds and his staff. Always pleasant in his office. The staff is great. Dr. Dodds is the best dentist I have ever had.",
    reviewer: "Healthgrades Patient",
  },
];

/* ─── Star Rating Component ─── */
function Stars({ rating, size = "w-5 h-5" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <LuStar
          key={i}
          className={`${size} ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

/* ─── Hero Section ─── */
function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-xl" />

      {/* Background image overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/logo.png"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-dark)]/90 via-[var(--color-primary)]/85 to-[var(--color-primary-light)]/90" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <LuSmile className="w-5 h-5" />
              {CLINIC.specialty}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-jakarta)] text-white leading-tight mb-4">
              {CLINIC.name}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-4">
              Your trusted family dentist in {CLINIC.city}, Idaho. Quality dental care with a gentle, personal touch.
            </p>

            {/* Trust badges */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
              <Stars rating={CLINIC.rating} />
              <span className="text-white font-semibold">{CLINIC.rating}</span>
              <span className="text-white/70">({CLINIC.reviewsCount} reviews)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
              <a
                href="#booking"
                className="w-full sm:w-auto px-8 py-4 bg-white text-[var(--color-primary)] font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <LuCalendar className="w-5 h-5" />
                Book Your Appointment
              </a>
              <a
                href={`tel:${CLINIC.phoneTel}`}
                className="w-full sm:w-auto px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/25 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
              >
                <LuPhone className="w-5 h-5" />
                {CLINIC.phone}
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center md:justify-start gap-6 text-white/60 text-sm">
              <span className="flex items-center gap-1.5">
                <LuMapPin className="w-4 h-4" />
                {CLINIC.city}, ID
              </span>
              <span className="flex items-center gap-1.5">
                <LuClock className="w-4 h-4" />
                Mon-Thu 8-5
              </span>
            </div>
          </div>

          {/* Team photo */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <img
                src="/images/hero.jpg"
                alt="Chad W. Dodds D.D.S. team"
                className="rounded-3xl shadow-2xl border-4 border-white/20 max-w-md w-full"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center">
                  <LuStar className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <div className="font-bold text-[var(--color-text)]">{CLINIC.rating}/5.0</div>
                  <div className="text-xs text-[var(--color-text-light)]">{CLINIC.reviewsCount} reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Services Section ─── */
function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary-50)] text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <LuStethoscope className="w-4 h-4" />
            Our Services
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-text)]">
            Comprehensive Dental Care
          </h2>
          <p className="mt-3 text-[var(--color-text-light)] max-w-xl mx-auto">
            From routine checkups to advanced cosmetic treatments, we provide complete dental services for the whole family.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICES.map((service) => (
            <div
              key={service.name}
              className="group bg-[var(--color-surface)] rounded-2xl p-5 hover:bg-white hover:shadow-lg hover:border-[var(--color-primary)] border border-transparent transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[var(--color-primary-50)] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                <service.icon className="w-6 h-6 text-[var(--color-primary)] group-hover:text-white transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-[var(--color-text)] font-[family-name:var(--font-jakarta)] text-sm sm:text-base">
                {service.name}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-light)] mt-1">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ─── */
function AboutSection() {
  return (
    <section id="about" className="py-20 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[var(--color-primary-50)] text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <LuUser className="w-4 h-4" />
              Meet Your Dentist
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-text)] mb-4">
              {CLINIC.dentist}
            </h2>
            <p className="text-[var(--color-text-light)] leading-relaxed mb-4">
              With years of dedicated service in {CLINIC.city}, {CLINIC.dentist} has built a reputation as one of the most trusted and caring dentists in the Magic Valley region. Specializing in both general and cosmetic dentistry, Dr. Dodds combines clinical excellence with a warm, patient-centered approach.
            </p>
            <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
              Whether you need a routine cleaning, a complete smile makeover, or emergency dental care, Dr. Dodds and his experienced staff are committed to making every visit comfortable and stress-free.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-[var(--color-primary-50)] text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-sm font-medium">General Dentistry</span>
              <span className="bg-[var(--color-primary-50)] text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-sm font-medium">Cosmetic Dentistry</span>
              <span className="bg-[var(--color-primary-50)] text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-sm font-medium">Implant Restoration</span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/images/doctor2.jpg"
                alt="Dr. Chad W. Dodds"
                className="w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center">
                  <LuStar className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <div className="font-bold text-[var(--color-text)]">{CLINIC.rating}/5.0</div>
                  <div className="text-xs text-[var(--color-text-light)]">{CLINIC.reviewsCount} reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials Section ─── */
function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary-50)] text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <LuStar className="w-4 h-4" />
            Patient Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-text)]">
            What Our Patients Say
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Stars rating={CLINIC.rating} />
            <span className="font-bold text-[var(--color-text)]">{CLINIC.rating}</span>
            <span className="text-[var(--color-text-light)]">from {CLINIC.reviewsCount} reviews</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="bg-[var(--color-surface)] rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <LuQuote className="w-8 h-8 text-[var(--color-primary)]/30 mb-4" />
              <p className="text-[var(--color-text-light)] leading-relaxed mb-4 text-sm">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {review.reviewer.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-text)] text-sm">{review.reviewer}</div>
                  <Stars rating={5} size="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Hours & Location Section ─── */
function HoursLocationSection() {
  return (
    <section id="location" className="py-20 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary-50)] text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <LuMapPin className="w-4 h-4" />
            Visit Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-text)]">
            Hours & Location
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold font-[family-name:var(--font-jakarta)] mb-4 flex items-center gap-2">
              <LuClock className="w-5 h-5 text-[var(--color-primary)]" />
              Office Hours
            </h3>
            <div className="space-y-3">
              {CLINIC.hours.map((h) => (
                <div
                  key={h.day}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    h.time !== "Closed" ? "bg-[var(--color-primary-50)]/50" : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-[var(--color-text)]">{h.day}</span>
                  <span
                    className={`text-sm font-medium ${
                      h.time !== "Closed" ? "text-[var(--color-primary)]" : "text-[var(--color-text-light)]"
                    }`}
                  >
                    {h.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <LuMapPin className="w-5 h-5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[var(--color-text)]">{CLINIC.address}</p>
                  <a
                    href={CLINIC.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] text-sm font-medium hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    Open in Google Maps
                    <LuChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <LuPhone className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                <a
                  href={`tel:${CLINIC.phoneTel}`}
                  className="font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {CLINIC.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.5!2d-114.461!3d42.5628!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDMzJzQ2LjEiTiAxMTTCsDI3JzM5LjYiVw!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Chad W. Dodds D.D.S. location"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Booking Section ─── */
function BookingSection() {
  return (
    <section id="booking" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary-50)] text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <LuCalendar className="w-4 h-4" />
            Online Booking
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-text)]">
            Book Your Appointment
          </h2>
          <p className="mt-3 text-[var(--color-text-light)] max-w-xl mx-auto">
            Select a date and time that works best for you. We&apos;ll confirm your appointment via email.
          </p>
        </div>

        <BookingForm />
      </div>
    </section>
  );
}

/* ─── Contact / CTA Section ─── */
function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
              Ready for a Healthier Smile?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Whether you need a routine checkup or a complete smile transformation, we are here to help. Contact us today.
            </p>

            <div className="space-y-4">
              <a
                href={`tel:${CLINIC.phoneTel}`}
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                  <LuPhone className="w-5 h-5" />
                </div>
                <span className="font-medium">{CLINIC.phone}</span>
              </a>

              <a
                href={`mailto:${CLINIC.email}`}
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                  <LuMail className="w-5 h-5" />
                </div>
                <span className="font-medium">{CLINIC.email}</span>
              </a>

              <a
                href={CLINIC.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                  <LuMapPin className="w-5 h-5" />
                </div>
                <span className="font-medium">{CLINIC.address}</span>
              </a>
            </div>

            <div className="mt-8 flex gap-4">
              <a
                href="#booking"
                className="px-8 py-3.5 bg-white text-[var(--color-primary)] font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg inline-flex items-center gap-2"
              >
                <LuCalendar className="w-5 h-5" />
                Book Online
              </a>
              <a
                href={`tel:${CLINIC.phoneTel}`}
                className="px-8 py-3.5 bg-white/15 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/25 transition-all duration-300 border border-white/30 inline-flex items-center gap-2"
              >
                <LuPhone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>

          {/* Staff photos */}
          <div className="space-y-4">
            <img
              src="/images/staff.jpg"
              alt="Friendly front desk staff"
              className="w-full h-56 object-cover rounded-2xl border-2 border-white/20 shadow-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <img
                src="/images/doctor1.jpg"
                alt="Dental hygienist"
                className="w-full h-40 object-cover rounded-2xl border-2 border-white/20 shadow-lg"
              />
              <img
                src="/images/office.jpg"
                alt="Office building"
                className="w-full h-40 object-cover rounded-2xl border-2 border-white/20 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-[var(--color-text)] text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/images/logo.png" alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />
              <h3 className="font-bold font-[family-name:var(--font-jakarta)] text-lg">{CLINIC.name}</h3>
            </div>
            <p className="text-white/60 text-sm">{CLINIC.specialty}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-white/70">
              <a href={`tel:${CLINIC.phoneTel}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <LuPhone className="w-4 h-4" />
                {CLINIC.phone}
              </a>
              <a href={`mailto:${CLINIC.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <LuMail className="w-4 h-4" />
                {CLINIC.email}
              </a>
              <div className="flex items-start gap-2">
                <LuMapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{CLINIC.address}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <a
              href={CLINIC.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
            >
              <FaFacebookF className="w-4 h-4" />
              Facebook
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          {new Date().getFullYear()} {CLINIC.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ─── Floating Phone Button ─── */
function FloatingPhone() {
  return (
    <a
      href={`tel:${CLINIC.phoneTel}`}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
      aria-label="Call us"
    >
      <LuPhone className="w-6 h-6" />
    </a>
  );
}

/* ─── Navigation ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <a href="#" className="font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-primary)] text-lg">
          <span className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="hidden sm:inline">Chad W. Dodds D.D.S.</span>
            <span className="sm:hidden">Dodds Dental</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--color-text-light)]">
          <a href="#services" className="hover:text-[var(--color-primary)] transition-colors">Services</a>
          <a href="#about" className="hover:text-[var(--color-primary)] transition-colors">About</a>
          <a href="#testimonials" className="hover:text-[var(--color-primary)] transition-colors">Reviews</a>
          <a href="#location" className="hover:text-[var(--color-primary)] transition-colors">Location</a>
        </div>

        <a
          href="#booking"
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-300"
        >
          Book Now
        </a>
      </div>
    </nav>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <InsuranceSection />
        <HoursLocationSection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingPhone />
    </>
  );
}
