'use client';



import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../../context/AuthContext';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../../lib/api';
import Hero3DBackground from '../../components/Hero3DBackground';

const THEME_HEX: Record<string, string> = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  green: '#22c55e',
  rose: '#f43f5e',
  orange: '#f97316',
  slate: '#64748b',
};

const getHexColor = (c?: string) => {
  if (!c) return '#6366f1';
  if (c.startsWith('#')) return c;
  return THEME_HEX[c] || '#6366f1';
};

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};



interface CardFormProps {

  id?: string;

}



export default function CardForm({ id }: CardFormProps) {

  const { user, isLoading: authLoading } = useAuth();

  const router = useRouter();

  const [checkingCards, setCheckingCards] = useState(true);



  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 5;



  const [categories, setCategories] = useState<any[]>([]);



  const [formData, setFormData] = useState({

    slug: '',

    card_type: '',

    category_id: '',

    subcategory_id: '',

    personal_info: { name: '', designation: '', bio: '', profile_image: '' },

    social_links: { email: '', phone: '', whatsapp: '', linkedin: '', instagram: '', facebook: '', twitter: '', youtube: '' },

    company_details: { company_name: '', website: '', address: '', gst: '' },

    payment_info: { upi_id: '', bank_name: '', account_number: '', ifsc_code: '', phonepe: '', qr_path: '' },

    proprietor_details: [{ name: '', designation: '', email: '', phone: '', whatsapp: '', dob: '', image: '' }],

    gallery_content: [] as string[],

    opening_hours: {

      monday: { open: '', close: '', closed: false },

      tuesday: { open: '', close: '', closed: false },

      wednesday: { open: '', close: '', closed: false },

      thursday: { open: '', close: '', closed: false },

      friday: { open: '', close: '', closed: false },

      saturday: { open: '', close: '', closed: false },

      sunday: { open: '', close: '', closed: true },

    },

    location_info: { map_url: '', address: '', latitude: '', longitude: '', pincode: '', state: '', city: '', village: '' },

    brochure_pdfs: [] as string[],

    custom_branding: {

      theme_color: 'blue',

      primary_color: '#3b82f6',

      secondary_color: '#eff6ff',

      show_social: true,

      show_company: true,

      show_payment: true,

      show_proprietor: true,

      show_gallery: true,

      show_hours: true,

      show_address: true,

      show_location: false,

      show_brochures: true,

      dark_mode_enabled: true

    }

  });



  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [socialFilter, setSocialFilter] = useState('');

  const [isVerifyingGst, setIsVerifyingGst] = useState(false);

  const [isGstVerified, setIsGstVerified] = useState(false);

  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string | null>(null);



  const [villages, setVillages] = useState<string[]>([]);

  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);



  const handlePincodeChange = async (pincode: string) => {

    setFormData(prev => ({ ...prev, location_info: { ...prev.location_info, pincode } }));



    if (pincode.length === 6) {

      setIsFetchingPincode(true);

      try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/verify-pincode/${pincode}`);

        const data = await res.json();



        // Backend returns: { status, city, state, post_offices: [...] }

        if (res.ok && data.status === 'Success') {

          const state = data.state || '';

          const city  = data.city  || '';

          const villageList = (data.post_offices || []).map((po: any) => po.Name).filter(Boolean);



          setVillages(villageList);

          setFormData(prev => ({

            ...prev,

            location_info: {

              ...prev.location_info,

              state,

              city,

              village: ''

            }

          }));

        }

      } catch (err) {

        console.error('Error fetching pincode', err);

      } finally {

        setIsFetchingPincode(false);

      }

    }

  };



  const getCurrentLocation = () => {

    if (typeof window !== 'undefined' && navigator.geolocation) {

      setIsFetchingLocation(true);

      navigator.geolocation.getCurrentPosition(

        (position) => {

          setFormData(prev => ({

            ...prev,

            location_info: {

              ...prev.location_info,

              latitude: position.coords.latitude.toString(),

              longitude: position.coords.longitude.toString()

            }

          }));

          setIsFetchingLocation(false);

        },

        (err) => {

          console.error("Geolocation error", err);

          setIsFetchingLocation(false);

        }

      );

    }

  };



  const verifyGstin = async (gstin: string) => {

    setIsVerifyingGst(true);

    setIsGstVerified(false);

    try {

      const res = await fetch('/api/verify-gst', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ gstNo: gstin }),

      });

      const data = await res.json();

      if (res.ok && data.success) {

        setIsGstVerified(true);

        // Autofill business name

        if (data.data?.legal_name) {

          setFormData(prev => ({

            ...prev,

            company_details: {

              ...(prev.company_details || {}),

              company_name: data.data.legal_name

            }

          }));

          // Clear company name error and gst error if any

          setValidationErrors(prev => {

            const copy = { ...prev };

            delete copy.company_name;

            delete copy.gst;

            return copy;

          });

        }

      } else {

        setValidationErrors(prev => ({

          ...prev,

          gst: data.error || 'GST number is not genuine or could not be verified.'

        }));

      }

    } catch (err) {

      console.error('GST Verification failed', err);

      setValidationErrors(prev => ({

        ...prev,

        gst: 'Failed to verify GST number. Please check your network.'

      }));

    } finally {

      setIsVerifyingGst(false);

    }

  };



  useEffect(() => {

    const fetchCategories = async () => {

      try {

        const res = await apiFetch<{ categories: any[] }>('/api/categories');

        if (res.categories) {

          setCategories(res.categories);

        }

      } catch (err) {

        console.error('Failed to fetch categories:', err);

      }

    };

    fetchCategories();

  }, []);



  useEffect(() => {

    if (!authLoading && !user) {

      router.push('/login');

      return;

    }



    const checkExistingCards = async () => {

      try {

        const data = await apiFetch<{ cards: any[] }>('/api/cards');

        if (data.cards && data.cards.length > 0 && !id) {

          router.push('/dashboard/cards');

        } else {

          setCheckingCards(false);

        }

      } catch (err) {

        setCheckingCards(false);

      }

    };



    const fetchCard = async () => {

      try {

        const res = await apiFetch<any>(`/api/cards/${id}`);

        const data = res.card;

        setFormData(prev => ({

          ...prev,

          ...data,

          category_id: data.category_id ? data.category_id.toString() : '',

          subcategory_id: data.subcategory_id ? data.subcategory_id.toString() : '',

          card_type: data.card_type || data.template_id || '',

          personal_info: { ...prev.personal_info, ...(data.personal_info || {}) },

          company_details: { ...prev.company_details, ...(data.company_details || {}) },

          social_links: { ...prev.social_links, ...(data.social_links || {}) },

          payment_info: { ...prev.payment_info, ...(data.payment_info || {}) },

          location_info: { ...prev.location_info, ...(data.location_info || {}) },

          custom_branding: { ...prev.custom_branding, ...(data.custom_branding || {}) },

          proprietor_details: Array.isArray(data.proprietor_details) && data.proprietor_details.length > 0

            ? data.proprietor_details

            : prev.proprietor_details,

          gallery_content: Array.isArray(data.gallery_content) ? data.gallery_content : prev.gallery_content,

          opening_hours: data.opening_hours ? { ...prev.opening_hours, ...data.opening_hours } : prev.opening_hours,

          brochure_pdfs: Array.isArray(data.brochure_pdfs) ? data.brochure_pdfs : prev.brochure_pdfs,

        }));

        // Pre-populate the profile image preview

        const existingProfileImage = data.profile_image || data.personal_info?.profile_image || null;

        if (existingProfileImage) setProfileImagePreviewUrl(existingProfileImage);

      } catch (err) {

        console.error(err);

        router.push('/dashboard/cards');

      } finally {

        setCheckingCards(false);

      }

    };



    if (user) {

      if (id) {

        fetchCard();

      } else {

        checkExistingCards();

        setFormData(prev => ({

          ...prev,

          personal_info: { ...prev.personal_info, name: user.name },

          social_links: { ...prev.social_links, email: user.email, phone: user.phone || '' },

        }));

      }

    }

  }, [user, authLoading, router, id]);



  const handleNext = () => {

    const newErrors: Record<string, string> = {};



    if (currentStep === 1) {

      if (!formData.card_type) {

        newErrors.card_type = 'Please select a card type.';

      }

    }

    if (currentStep === 2) {

      if (!formData.personal_info?.name?.trim()) {

        newErrors.name = 'Full Name is required.';

      }

      if (!formData.category_id) {

        newErrors.category_id = 'Category is required.';

      }

      if (!formData.subcategory_id) {

        newErrors.subcategory_id = 'Subcategory is required.';

      }

    }

    if (currentStep === 3) {

      // Validate Phone

      const phone = formData.social_links?.phone?.trim();

      if (!phone) {

        newErrors.phone = 'Phone Number is required.';

      } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(phone)) {

        newErrors.phone = 'Please enter a valid Phone Number (10-15 digits).';

      }



      // Validate Email

      const email = formData.social_links?.email?.trim();

      if (!email) {

        newErrors.email = 'Email is required.';

      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        newErrors.email = 'Please enter a valid email address.';

      }



      // Validate WhatsApp

      const whatsapp = formData.social_links?.whatsapp?.trim();

      if (!whatsapp) {

        newErrors.whatsapp = 'WhatsApp Number is required.';

      } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(whatsapp)) {

        newErrors.whatsapp = 'Please enter a valid WhatsApp Number (10-15 digits).';

      }



      // Validate social URLs

      const socialKeys = ['linkedin', 'instagram', 'facebook', 'twitter', 'youtube'] as const;

      socialKeys.forEach(key => {

        const url = formData.social_links?.[key]?.trim();

        if (url && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url)) {

          newErrors[key] = 'Please enter a valid URL starting with http:// or https://';

        }

      });

    }

    if (currentStep === 4) {

      if (formData.custom_branding.show_company) {

        if (!formData.company_details?.company_name?.trim()) {

          newErrors.company_name = 'Company Name is required.';

        }

        const website = formData.company_details?.website?.trim();

        if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(website)) {

          newErrors.website = 'Please enter a valid Website URL starting with http:// or https://';

        }

        const gst = formData.company_details?.gst?.trim();

        if (gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gst)) {

          newErrors.gst = 'Please enter a valid 15-character GST number.';

        }

      }

      if (formData.custom_branding.show_proprietor) {

        formData.proprietor_details.forEach((proprietor, index) => {

          if (proprietor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proprietor.email)) {

            newErrors[`proprietor_${index}_email`] = 'Please enter a valid email address.';

          }

        });

      }

      if (formData.custom_branding.show_payment) {

        const upi_id = formData.payment_info?.upi_id?.trim();

        if (upi_id && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi_id)) {

          newErrors.upi_id = 'Please enter a valid UPI ID.';

        }

        const ifsc_code = formData.payment_info?.ifsc_code?.trim();

        if (ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc_code)) {

          newErrors.ifsc_code = 'Please enter a valid 11-digit IFSC code.';

        }

        const account_number = formData.payment_info?.account_number?.trim();

        if (account_number && !/^[0-9]{9,18}$/.test(account_number)) {

          newErrors.account_number = 'Please enter a valid Bank Account Number (9-18 digits).';

        }

        const phonepe = formData.payment_info?.phonepe?.trim();

        if (phonepe && !/^\+?[0-9\s\-()]{10,15}$/.test(phonepe)) {

          newErrors.phonepe = 'Please enter a valid PhonePe Number (10-15 digits).';

        }

      }

    }



    setValidationErrors(newErrors);



    if (Object.keys(newErrors).length > 0) {

      setError('');

      return;

    }



    setError('');

    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);

  };



  const handlePrev = () => {

    setError('');

    setValidationErrors({});

    if (currentStep > 1) setCurrentStep(prev => prev - 1);

  };



  const generateSlug = (name: string) => {

    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

  };



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;



    const formPayload = new FormData();

    formPayload.append('file', file);

    formPayload.append('type', 'image');



    try {

      const token = localStorage.getItem('card-setu-token');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {

        method: 'POST',

        headers: { 'Authorization': `Bearer ${token}` },

        body: formPayload

      });



      const data = await res.json();

      if (res.ok) {

        setFormData(prev => ({

          ...prev,

          profile_image: data.url,

          personal_info: { ...prev.personal_info, profile_image: data.url }

        }));

        setProfileImagePreviewUrl(data.url);

      } else {

        console.error('Upload failed:', data);

      }

    } catch (err) {

      console.error('Upload error:', err);

    }

  };



  const handleProprietorImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;



    const formPayload = new FormData();

    formPayload.append('file', file);

    formPayload.append('type', 'image');



    try {

      const token = localStorage.getItem('card-setu-token');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {

        method: 'POST',

        headers: { 'Authorization': `Bearer ${token}` },

        body: formPayload

      });



      const data = await res.json();

      if (res.ok) {

        const newDetails = [...formData.proprietor_details];

        newDetails[index].image = data.url;

        setFormData({ ...formData, proprietor_details: newDetails });

      } else {

        console.error('Upload failed:', data);

      }

    } catch (err) {

      console.error('Upload error:', err);

    }

  };





  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;



    const formPayload = new FormData();

    formPayload.append('file', file);

    formPayload.append('type', 'image');



    try {

      const token = localStorage.getItem('card-setu-token');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {

        method: 'POST',

        headers: { 'Authorization': `Bearer ${token}` },

        body: formPayload

      });



      const data = await res.json();

      if (res.ok) {

        setFormData(prev => ({

          ...prev,

          payment_info: { ...(prev.payment_info || {}), qr_path: data.url }

        }));

      }

    } catch (err) {

      console.error('Upload failed', err);

    }

  };



  const handleSubmit = async () => {

    setIsSubmitting(true);

    setError('');

    setValidationErrors({});



    const newErrors: Record<string, string> = {};

    if (!formData.personal_info?.name?.trim()) {

      newErrors.name = 'Full Name is required.';

    }

    if (!formData.category_id) {

      newErrors.category_id = 'Category is required.';

    }

    if (!formData.subcategory_id) {

      newErrors.subcategory_id = 'Subcategory is required.';

    }



    // Contact step validations

    const phone = formData.social_links?.phone?.trim();

    if (!phone) {

      newErrors.phone = 'Phone Number is required.';

    } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(phone)) {

      newErrors.phone = 'Please enter a valid Phone Number (10-15 digits).';

    }



    const email = formData.social_links?.email?.trim();

    if (!email) {

      newErrors.email = 'Email is required.';

    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

      newErrors.email = 'Please enter a valid email address.';

    }



    const whatsapp = formData.social_links?.whatsapp?.trim();

    if (!whatsapp) {

      newErrors.whatsapp = 'WhatsApp Number is required.';

    } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(whatsapp)) {

      newErrors.whatsapp = 'Please enter a valid WhatsApp Number (10-15 digits).';

    }



    const socialKeys = ['linkedin', 'instagram', 'facebook', 'twitter', 'youtube'] as const;

    socialKeys.forEach(key => {

      const url = formData.social_links?.[key]?.trim();

      if (url && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url)) {

        newErrors[key] = 'Please enter a valid URL starting with http:// or https://';

      }

    });



    // Step 4 validations

    if (formData.custom_branding.show_company) {

      if (!formData.company_details?.company_name?.trim()) {

        newErrors.company_name = 'Company Name is required.';

      }

      const website = formData.company_details?.website?.trim();

      if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(website)) {

        newErrors.website = 'Please enter a valid Website URL starting with http:// or https://';

      }

      const gst = formData.company_details?.gst?.trim();

      if (gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gst)) {

        newErrors.gst = 'Please enter a valid 15-character GST number.';

      }

    }

    if (formData.custom_branding.show_proprietor) {

      formData.proprietor_details.forEach((proprietor, index) => {

        if (proprietor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proprietor.email)) {

          newErrors[`proprietor_${index}_email`] = 'Please enter a valid email address.';

        }

      });

    }

    if (formData.custom_branding.show_payment) {

      const upi_id = formData.payment_info?.upi_id?.trim();

      if (upi_id && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi_id)) {

        newErrors.upi_id = 'Please enter a valid UPI ID.';

      }

      const ifsc_code = formData.payment_info?.ifsc_code?.trim();

      if (ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc_code)) {

        newErrors.ifsc_code = 'Please enter a valid 11-digit IFSC code.';

      }

      const account_number = formData.payment_info?.account_number?.trim();

      if (account_number && !/^[0-9]{9,18}$/.test(account_number)) {

        newErrors.account_number = 'Please enter a valid Bank Account Number (9-18 digits).';

      }

      const phonepe = formData.payment_info?.phonepe?.trim();

      if (phonepe && !/^\+?[0-9\s\-()]{10,15}$/.test(phonepe)) {

        newErrors.phonepe = 'Please enter a valid PhonePe Number (10-15 digits).';

      }

    }



    setValidationErrors(newErrors);



    if (Object.keys(newErrors).length > 0) {

      setIsSubmitting(false);

      return;

    }



    const payload = {

      ...formData,

      category_id: formData.category_id ? parseInt(formData.category_id) : null,

      subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,

      template_id: formData.card_type,

      slug: formData.slug || generateSlug(formData.personal_info.name || 'card'),

      // Explicitly construct personal_info to ensure all fields are included

      personal_info: {

        name: formData.personal_info?.name || '',

        designation: formData.personal_info?.designation || '',

        bio: formData.personal_info?.bio || '',

        profile_image: formData.personal_info?.profile_image || '',

      },

    };



    console.log('[CardForm] Submitting payload personal_info:', payload.personal_info);



    try {

      if (id) {

        await apiFetch(`/api/cards/${id}`, {

          method: 'PUT',

          body: JSON.stringify(payload),

        });

        router.push('/dashboard/cards');

      } else {

        const res = await apiFetch<{ card: any }>('/api/cards', {

          method: 'POST',

          body: JSON.stringify(payload),

        });

        router.push('/dashboard/cards');

      }

    } catch (err: any) {

      setError(err.message || 'Failed to save card. Please try again.');

      setIsSubmitting(false);

    }

  };



  const renderStepContent = () => {

    switch (currentStep) {

      case 1:

        return (

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

            <div>

              <h2 className="text-2xl font-bold mb-2">Choose Card Type</h2>

              <p className="text-gray-400 mb-6">Select the foundation for your digital identity.</p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {[

                { id: 'personal', title: 'Personal', desc: 'Share your personal contacts and social links.', icon: 'user' },

                { id: 'professional', title: 'Professional', desc: 'For freelancers to showcase work and skills.', icon: 'briefcase' },

                { id: 'business', title: 'Business', desc: 'Include company details, GST, and payment info.', icon: 'building' }

              ].map((type) => (

                <div

                  key={type.id}

                  onClick={() => setFormData({ ...formData, card_type: type.id })}

                  className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${formData.card_type === type.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'

                    }`}

                >

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${formData.card_type === type.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}>

                    <div className="w-6 h-6 border-2 border-current rounded-full" />

                  </div>

                  <h3 className="text-xl font-bold mb-2">{type.title}</h3>

                  <p className="text-sm text-gray-400 leading-relaxed">{type.desc}</p>

                </div>

              ))}

            </div>

          </motion.div>

        );

      case 2:

        return (

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

            <div>

              <h2 className="text-2xl font-bold mb-2">Basic Information</h2>

              <p className="text-gray-400 mb-6">Your profile picture and identity.</p>

            </div>

            <div className="space-y-4">

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">

                {profileImagePreviewUrl ? (

                  <img src={profileImagePreviewUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />

                ) : (

                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border-2 border-dashed border-white/20">Img</div>

                )}

                <div>

                  <label className="text-sm text-gray-400 block mb-1">Profile Photo</label>

                  <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20" />

                </div>

              </div>



              <div>

                <label className="text-sm text-gray-400 block mb-1">Full Name <span className="text-red-500">*</span></label>

                <input

                  type="text"

                  value={formData.personal_info?.name || ''}

                  onChange={(e) => {

                    setFormData({ ...formData, personal_info: { ...(formData.personal_info || {}), name: e.target.value } });

                    if (validationErrors.name) {

                      setValidationErrors(prev => {

                        const copy = { ...prev };

                        delete copy.name;

                        return copy;

                      });

                    }

                  }}

                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all ${

                    validationErrors.name ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10'

                  }`}

                  required

                />

                {validationErrors.name && (

                  <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>

                )}

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="text-sm text-gray-400 block mb-1">Category <span className="text-red-500">*</span></label>

                  <select

                    value={formData.category_id || ''}

                    onChange={(e) => {

                      setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' });

                      if (validationErrors.category_id || validationErrors.subcategory_id) {

                        setValidationErrors(prev => {

                          const copy = { ...prev };

                          delete copy.category_id;

                          delete copy.subcategory_id;

                          return copy;

                        });

                      }

                    }}

                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all ${

                      validationErrors.category_id ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10'

                    }`}

                    required

                  >

                    <option value="" className="bg-gray-900">Select Category</option>

                    <optgroup label="Departments" className="bg-gray-900 font-semibold text-blue-400">

                      {categories.filter(c => c.type === 'department').map(c => (

                        <option key={c.id} value={c.id} className="bg-gray-900 text-white font-normal">{c.name}</option>

                      ))}

                    </optgroup>

                    <optgroup label="Business Categories" className="bg-gray-900 font-semibold text-blue-400">

                      {categories.filter(c => c.type === 'business').map(c => (

                        <option key={c.id} value={c.id} className="bg-gray-900 text-white font-normal">{c.name}</option>

                      ))}

                    </optgroup>

                  </select>

                  {validationErrors.category_id && (

                    <p className="text-xs text-red-500 mt-1">{validationErrors.category_id}</p>

                  )}

                </div>

                <div>

                  <label className="text-sm text-gray-400 block mb-1">Subcategory <span className="text-red-500">*</span></label>

                  <select

                    value={formData.subcategory_id || ''}

                    onChange={(e) => {

                      setFormData({ ...formData, subcategory_id: e.target.value });

                      if (validationErrors.subcategory_id) {

                        setValidationErrors(prev => {

                          const copy = { ...prev };

                          delete copy.subcategory_id;

                          return copy;

                        });

                      }

                    }}

                    disabled={!formData.category_id}

                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${

                      validationErrors.subcategory_id ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10'

                    }`}

                    required

                  >

                    <option value="" className="bg-gray-900">Select Subcategory</option>

                    {categories.find(c => c.id.toString() === formData.category_id)?.children?.map((c: any) => (

                      <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>

                    ))}

                  </select>

                  {validationErrors.subcategory_id && (

                    <p className="text-xs text-red-500 mt-1">{validationErrors.subcategory_id}</p>

                  )}

                </div>

              </div>

              <div>

                <label className="text-sm text-gray-400 block mb-1">Designation / Title</label>

                <input type="text" value={formData.personal_info?.designation || ''} onChange={(e) => setFormData({ ...formData, personal_info: { ...(formData.personal_info || {}), designation: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. CEO, Software Engineer" />

              </div>

              <div>

                <label className="text-sm text-gray-400 block mb-1">Short Bio</label>

                <textarea value={formData.personal_info?.bio || ''} onChange={(e) => setFormData({ ...formData, personal_info: { ...(formData.personal_info || {}), bio: e.target.value } })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />

              </div>

            </div>

          </motion.div>

        );

      case 3:

        return (

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

            <div>

              <h2 className="text-2xl font-bold mb-2">Contact & Social</h2>

              <p className="text-gray-400 mb-6">How your leads and clients will reach you.</p>

            </div>



            <div className="space-y-6">

              {/* Contact Information Section */}

              <div>

                <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {[

                    { key: 'phone', label: 'Phone Number', type: 'tel', required: true },

                    { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', required: true },

                    { key: 'email', label: 'Email', type: 'email', required: true },

                  ].map(field => {

                    const hasError = !!validationErrors[field.key];

                    return (

                      <div key={field.key}>

                        <label className="text-sm text-gray-400 block mb-1">

                          {field.label} {field.required && <span className="text-red-500">*</span>}

                        </label>

                        <input

                          type={field.type}

                          value={(formData.social_links as any)?.[field.key] || ''}

                          onChange={(e) => {

                            const val = e.target.value;

                            setFormData({

                              ...formData,

                              social_links: {

                                ...(formData.social_links || {}),

                                [field.key]: val

                              }

                            });



                            // Real-time validation

                            let errorMsg = '';

                            if (field.key === 'phone') {

                              if (!val.trim()) {

                                errorMsg = 'Phone Number is required.';

                              } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(val.trim())) {

                                errorMsg = 'Please enter a valid Phone Number (10-15 digits).';

                              }

                            } else if (field.key === 'email') {

                              if (!val.trim()) {

                                errorMsg = 'Email is required.';

                              } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {

                                errorMsg = 'Please enter a valid email address.';

                              }

                            } else if (field.key === 'whatsapp') {

                              if (!val.trim()) {

                                errorMsg = 'WhatsApp Number is required.';

                              } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(val.trim())) {

                                errorMsg = 'Please enter a valid WhatsApp Number (10-15 digits).';

                              }

                            }



                            // Update validation errors state

                            setValidationErrors(prev => {

                              const copy = { ...prev };

                              if (errorMsg) {

                                copy[field.key] = errorMsg;

                              } else {

                                delete copy[field.key];

                              }

                              return copy;

                            });

                          }}

                          className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                            hasError

                              ? 'border-red-500/80 focus:border-red-500 bg-red-500/5'

                              : 'border-white/10 focus:border-blue-500'

                          }`}

                        />

                        {hasError && (

                          <p className="text-xs text-red-500 mt-1">{validationErrors[field.key]}</p>

                        )}

                      </div>

                    );

                  })}

                </div>

              </div>



              {/* Social Media Section */}

              <div>

                <h3 className="text-lg font-semibold text-white mb-3">Social Media Profiles</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {[

                    { key: 'linkedin', label: 'LinkedIn Profile', type: 'url', placeholder: 'https://linkedin.com/...' },

                    { key: 'instagram', label: 'Instagram Profile', type: 'url', placeholder: 'https://instagram.com/...' },

                    { key: 'facebook', label: 'Facebook Profile', type: 'url', placeholder: 'https://facebook.com/...' },

                    { key: 'twitter', label: 'Twitter / X Profile', type: 'url', placeholder: 'https://twitter.com/...' },

                    { key: 'youtube', label: 'YouTube Channel', type: 'url', placeholder: 'https://youtube.com/...' },

                  ].map(field => {

                    const hasError = !!validationErrors[field.key];

                    return (

                      <div key={field.key}>

                        <label className="text-sm text-gray-400 block mb-1">{field.label}</label>

                        <input

                          type={field.type}

                          value={(formData.social_links as any)?.[field.key] || ''}

                          onChange={(e) => {

                            const val = e.target.value;

                            setFormData({

                              ...formData,

                              social_links: {

                                ...(formData.social_links || {}),

                                [field.key]: val

                              }

                            });



                            // Real-time validation

                            let errorMsg = '';

                            if (val.trim() && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val.trim())) {

                              errorMsg = 'Please enter a valid URL starting with http:// or https://';

                            }



                            // Update validation errors state

                            setValidationErrors(prev => {

                              const copy = { ...prev };

                              if (errorMsg) {

                                copy[field.key] = errorMsg;

                              } else {

                                delete copy[field.key];

                              }

                              return copy;

                            });

                          }}

                          className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                            hasError

                              ? 'border-red-500/80 focus:border-red-500 bg-red-500/5'

                              : 'border-white/10 focus:border-blue-500'

                          }`}

                          placeholder={field.placeholder}

                        />

                        {hasError && (

                          <p className="text-xs text-red-500 mt-1">{validationErrors[field.key]}</p>

                        )}

                      </div>

                    );

                  })}

                </div>

              </div>

            </div>

          </motion.div>

        );

      case 4:

        return (

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

            <div>

              <h2 className="text-2xl font-bold mb-2">Business & Payments</h2>

              <p className="text-gray-400 mb-6">Setup your company details and payment links.</p>

            </div>



            <div className="space-y-6">

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Company Information</h3>

                    <p className="text-sm text-gray-400">Display your brand's details</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input

                      type="checkbox"

                      className="sr-only peer"

                      checked={formData.custom_branding.show_company}

                      onChange={(e) => {

                        const checked = e.target.checked;

                        setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_company: checked } });

                        if (!checked) {

                          setValidationErrors(prev => {

                            const copy = { ...prev };

                            delete copy.company_name;

                            delete copy.gst;

                            delete copy.website;

                            return copy;

                          });

                        }

                      }}

                    />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_company && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">Company Name <span className="text-red-500">*</span></label>

                        <input

                          type="text"

                          value={formData.company_details?.company_name || ''}

                          onChange={(e) => {

                            const val = e.target.value;

                            setFormData({ ...formData, company_details: { ...(formData.company_details || {}), company_name: val } });



                            let errorMsg = '';

                            if (!val.trim()) {

                              errorMsg = 'Company Name is required.';

                            }



                            setValidationErrors(prev => {

                              const copy = { ...prev };

                              if (errorMsg) copy.company_name = errorMsg;

                              else delete copy.company_name;

                              return copy;

                            });

                          }}

                          className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                            validationErrors.company_name ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'

                          }`}

                        />

                        {validationErrors.company_name && (

                          <p className="text-xs text-red-500 mt-1">{validationErrors.company_name}</p>

                        )}

                      </div>

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">GST Number</label>

                        <div className="relative">

                          <input

                            type="text"

                            value={formData.company_details?.gst || ''}

                            onChange={(e) => {

                              const val = e.target.value.toUpperCase(); // GSTIN is uppercase

                              setFormData({ ...formData, company_details: { ...(formData.company_details || {}), gst: val } });



                              let errorMsg = '';

                              if (val.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(val.trim())) {

                                errorMsg = 'Please enter a valid 15-character GST number.';

                              }



                              setValidationErrors(prev => {

                                const copy = { ...prev };

                                if (errorMsg) copy.gst = errorMsg;

                                else delete copy.gst;

                                return copy;

                              });



                              // Trigger verification when length reaches exactly 15 and format is correct

                              if (val.trim().length === 15 && !errorMsg) {

                                verifyGstin(val.trim());

                              } else {

                                setIsGstVerified(false);

                              }

                            }}

                            className={`w-full bg-white/5 border rounded-xl pl-4 pr-24 py-3 text-white focus:outline-none transition-all ${

                              validationErrors.gst

                                ? 'border-red-500/80 focus:border-red-500 bg-red-500/5'

                                : isGstVerified

                                ? 'border-green-500/80 focus:border-green-500 bg-green-500/5'

                                : 'border-white/10 focus:border-blue-500'

                            }`}

                            placeholder="e.g. 08GROPS2567D1Z8"

                            maxLength={15}

                          />

                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">

                            {isVerifyingGst && (

                              <svg className="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">

                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

                              </svg>

                            )}

                            {!isVerifyingGst && isGstVerified && (

                              <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-2 py-0.5 text-[10px] font-bold">

                                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>

                                Verified

                              </div>

                            )}

                          </div>

                        </div>

                        {validationErrors.gst && (

                          <p className="text-xs text-red-500 mt-1">{validationErrors.gst}</p>

                        )}

                      </div>

                    </div>

                    <div>

                      <label className="text-sm text-gray-400 block mb-1">Website URL</label>

                      <input

                        type="url"

                        value={formData.company_details?.website || ''}

                        onChange={(e) => {

                          const val = e.target.value;

                          setFormData({ ...formData, company_details: { ...(formData.company_details || {}), website: val } });



                          let errorMsg = '';

                          if (val.trim() && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val.trim())) {

                            errorMsg = 'Please enter a valid Website URL starting with http:// or https://';

                          }



                          setValidationErrors(prev => {

                            const copy = { ...prev };

                            if (errorMsg) copy.website = errorMsg;

                            else delete copy.website;

                            return copy;

                          });

                        }}

                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                          validationErrors.website ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'

                        }`}

                      />

                      {validationErrors.website && (

                        <p className="text-xs text-red-500 mt-1">{validationErrors.website}</p>

                      )}

                    </div>

                  </motion.div>

                )}

              </div>



              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Payment Details</h3>

                    <p className="text-sm text-gray-400">Allow clients to pay you directly</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input

                      type="checkbox"

                      className="sr-only peer"

                      checked={formData.custom_branding.show_payment}

                      onChange={(e) => {

                        const checked = e.target.checked;

                        setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_payment: checked } });

                        if (!checked) {

                          setValidationErrors(prev => {

                            const copy = { ...prev };

                            delete copy.upi_id;

                            delete copy.ifsc_code;

                            delete copy.account_number;

                            delete copy.phonepe;

                            return copy;

                          });

                        }

                      }}

                    />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_payment && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-8">

                    

                    {/* Bank Details Section */}

                    <div>

                      <h4 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">

                        Bank Details

                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="md:col-span-2">

                          <label className="text-sm text-gray-400 block mb-1">Bank Name</label>

                          <input type="text" value={formData.payment_info?.bank_name || ''} onChange={(e) => setFormData({ ...formData, payment_info: { ...(formData.payment_info || {}), bank_name: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />

                        </div>

                        <div>

                          <label className="text-sm text-gray-400 block mb-1">Account Number</label>

                          <input

                            type="text"

                            value={formData.payment_info?.account_number || ''}

                            onChange={(e) => {

                              const val = e.target.value;

                              setFormData({ ...formData, payment_info: { ...(formData.payment_info || {}), account_number: val } });



                              let errorMsg = '';

                              if (val.trim() && !/^[0-9]{9,18}$/.test(val.trim())) {

                                errorMsg = 'Please enter a valid Bank Account Number (9-18 digits).';

                              }



                              setValidationErrors(prev => {

                                const copy = { ...prev };

                                if (errorMsg) copy.account_number = errorMsg;

                                else delete copy.account_number;

                                return copy;

                              });

                            }}

                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                              validationErrors.account_number ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'

                            }`}

                          />

                          {validationErrors.account_number && (

                            <p className="text-xs text-red-500 mt-1">{validationErrors.account_number}</p>

                          )}

                        </div>

                        <div>

                          <label className="text-sm text-gray-400 block mb-1">IFSC Code</label>

                          <input

                            type="text"

                            value={formData.payment_info?.ifsc_code || ''}

                            onChange={(e) => {

                              const val = e.target.value;

                              setFormData({ ...formData, payment_info: { ...(formData.payment_info || {}), ifsc_code: val } });



                              let errorMsg = '';

                              if (val.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(val.trim())) {

                                errorMsg = 'Please enter a valid 11-digit IFSC code.';

                              }



                              setValidationErrors(prev => {

                                const copy = { ...prev };

                                if (errorMsg) copy.ifsc_code = errorMsg;

                                else delete copy.ifsc_code;

                                return copy;

                              });

                            }}

                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                              validationErrors.ifsc_code ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'

                            }`}

                          />

                          {validationErrors.ifsc_code && (

                            <p className="text-xs text-red-500 mt-1">{validationErrors.ifsc_code}</p>

                          )}

                        </div>

                      </div>

                    </div>



                    {/* Bar Code / UPI Section */}

                    <div>

                      <h4 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">

                        Bar Code / UPI

                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>

                          <label className="text-sm text-gray-400 block mb-1">Payment QR Code</label>

                          <div className="flex items-center gap-3">

                            {formData.payment_info?.qr_path && (

                              <img src={formData.payment_info.qr_path} alt="QR" className="h-10 w-10 rounded-lg object-cover bg-white p-0.5" />

                            )}

                            <input type="file" accept="image/*" onChange={handleQrUpload} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20" />

                          </div>

                        </div>

                        <div>

                          <label className="text-sm text-gray-400 block mb-1">UPI ID</label>

                          <input

                            type="text"

                            value={formData.payment_info?.upi_id || ''}

                            onChange={(e) => {

                              const val = e.target.value;

                              setFormData({ ...formData, payment_info: { ...(formData.payment_info || {}), upi_id: val } });



                              let errorMsg = '';

                              if (val.trim() && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(val.trim())) {

                                errorMsg = 'Please enter a valid UPI ID.';

                              }



                              setValidationErrors(prev => {

                                const copy = { ...prev };

                                if (errorMsg) copy.upi_id = errorMsg;

                                else delete copy.upi_id;

                                return copy;

                              });

                            }}

                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                              validationErrors.upi_id ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'

                            }`}

                            placeholder="username@upi"

                          />

                          {validationErrors.upi_id && (

                            <p className="text-xs text-red-500 mt-1">{validationErrors.upi_id}</p>

                          )}

                        </div>

                        <div>

                          <label className="text-sm text-gray-400 block mb-1">PhonePe Number</label>

                          <input

                            type="text"

                            value={formData.payment_info?.phonepe || ''}

                            onChange={(e) => {

                              const val = e.target.value;

                              setFormData({ ...formData, payment_info: { ...(formData.payment_info || {}), phonepe: val } });



                              let errorMsg = '';

                              if (val.trim() && !/^\+?[0-9\s\-()]{10,15}$/.test(val.trim())) {

                                errorMsg = 'Please enter a valid PhonePe Number (10-15 digits).';

                              }



                              setValidationErrors(prev => {

                                const copy = { ...prev };

                                if (errorMsg) copy.phonepe = errorMsg;

                                else delete copy.phonepe;

                                return copy;

                              });

                            }}

                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${

                              validationErrors.phonepe ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'

                            }`}

                            placeholder="e.g. 9876543210"

                          />

                          {validationErrors.phonepe && (

                            <p className="text-xs text-red-500 mt-1">{validationErrors.phonepe}</p>

                          )}

                        </div>

                      </div>

                    </div>

                  </motion.div>

                )}

              </div>



              {/* Proprietor / Team Details */}

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Proprietor / Team Details</h3>

                    <p className="text-sm text-gray-400">Add founders, co-founders, or key team members</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input type="checkbox" className="sr-only peer" checked={formData.custom_branding.show_proprietor} onChange={(e) => setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_proprietor: e.target.checked } })} />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_proprietor && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">

                    {formData.proprietor_details.map((proprietor, index) => (

                      <div key={index} className="space-y-4 p-4 border border-white/10 rounded-xl bg-black/10 relative">

                        {formData.proprietor_details.length > 1 && (

                          <button

                            type="button"

                            onClick={() => {

                              const newDetails = [...formData.proprietor_details];

                              newDetails.splice(index, 1);

                              setFormData({ ...formData, proprietor_details: newDetails });

                            }}

                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"

                          >

                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>

                          </button>

                        )}

                        <div className="flex flex-col sm:flex-row gap-4 mb-4">

                          <div className="shrink-0">

                            <label className="text-sm text-gray-400 block mb-2">Photo</label>

                            <div className="relative w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center hover:border-blue-500 transition-colors group cursor-pointer">

                              {proprietor.image ? (

                                <img src={proprietor.image} alt={proprietor.name} className="w-full h-full object-cover" />

                              ) : (

                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>

                              )}

                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>

                              </div>

                              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleProprietorImageUpload(index, e)} />

                            </div>

                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>

                              <label className="text-sm text-gray-400 block mb-1">Name</label>

                              <input type="text" value={proprietor.name || ''} onChange={(e) => {

                                const newDetails = [...formData.proprietor_details];

                                newDetails[index].name = e.target.value;

                                setFormData({ ...formData, proprietor_details: newDetails });

                              }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="John Doe" />

                            </div>

                            <div>

                              <label className="text-sm text-gray-400 block mb-1">Designation</label>

                              <input type="text" value={proprietor.designation || ''} onChange={(e) => {

                                const newDetails = [...formData.proprietor_details];

                                newDetails[index].designation = e.target.value;

                                setFormData({ ...formData, proprietor_details: newDetails });

                              }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="Co-Founder" />

                            </div>

                          </div>

                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div>

                            <label className="text-sm text-gray-400 block mb-1">Email</label>

                            <input type="email" value={proprietor.email || ''} onChange={(e) => {

                              const newDetails = [...formData.proprietor_details];

                              newDetails[index].email = e.target.value;

                              setFormData({ ...formData, proprietor_details: newDetails });

                            }} className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${validationErrors[`proprietor_${index}_email`] ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'}`} placeholder="john@example.com" />

                            {validationErrors[`proprietor_${index}_email`] && <p className="text-xs text-red-500 mt-1">{validationErrors[`proprietor_${index}_email`]}</p>}

                          </div>

                          <div>

                            <label className="text-sm text-gray-400 block mb-1">Phone Number</label>

                            <input type="tel" value={proprietor.phone || ''} onChange={(e) => {

                              const newDetails = [...formData.proprietor_details];

                              newDetails[index].phone = e.target.value;

                              setFormData({ ...formData, proprietor_details: newDetails });

                            }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="+1234567890" />

                          </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div>

                            <label className="text-sm text-gray-400 block mb-1">WhatsApp Number</label>

                            <input type="tel" value={proprietor.whatsapp || ''} onChange={(e) => {

                              const newDetails = [...formData.proprietor_details];

                              newDetails[index].whatsapp = e.target.value;

                              setFormData({ ...formData, proprietor_details: newDetails });

                            }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="+1234567890" />

                          </div>

                          <div>

                            <label className="text-sm text-gray-400 block mb-1">Date of Birth</label>

                            <input type="date" value={proprietor.dob || ''} onChange={(e) => {

                              const newDetails = [...formData.proprietor_details];

                              newDetails[index].dob = e.target.value;

                              setFormData({ ...formData, proprietor_details: newDetails });

                            }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />

                          </div>

                        </div>

                      </div>

                    ))}

                    <button

                      type="button"

                      onClick={() => {

                        setFormData({

                          ...formData,

                          proprietor_details: [...formData.proprietor_details, { name: '', designation: '', email: '', phone: '', whatsapp: '', dob: '', image: '' }]

                        });

                      }}

                      className="w-full py-3 bg-white/5 border border-white/10 border-dashed rounded-xl text-blue-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"

                    >

                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>

                      Add Another Member

                    </button>

                  </motion.div>

                )}

              </div>



              {/* Gallery Content */}

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Gallery Content</h3>

                    <p className="text-sm text-gray-400">Add photos, videos, or graphics</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input type="checkbox" className="sr-only peer" checked={formData.custom_branding.show_gallery} onChange={(e) => setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_gallery: e.target.checked } })} />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_gallery && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">

                    <p className="text-sm text-gray-400 mb-2">Upload images to your gallery.</p>

                    {/* Placeholder for actual file upload mapping. In real integration, upload to API and save URLs. */}

                    <input type="file" multiple accept="image/*,video/*" onChange={async (e) => {

                      if (!e.target.files) return;

                      const files = Array.from(e.target.files);

                      const newGallery = [...formData.gallery_content];

                      for (const file of files) {

                        const formPayload = new FormData();

                        formPayload.append('file', file);

                        formPayload.append('type', 'image');

                        try {

                          const token = localStorage.getItem('card-setu-token');

                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {

                            method: 'POST',

                            headers: { 'Authorization': `Bearer ${token}` },

                            body: formPayload

                          });

                          const data = await res.json();

                          if (res.ok && data.url) {

                            newGallery.push(data.url);

                          }

                        } catch (err) {

                          console.error('Gallery upload failed', err);

                        }

                      }

                      setFormData({ ...formData, gallery_content: newGallery });

                    }} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20" />

                    <div className="flex flex-wrap gap-4 mt-4">

                      {formData.gallery_content.map((url: string, idx: number) => (

                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 group">

                          <img src={url} alt="Gallery item" className="w-full h-full object-cover" />

                          <button type="button" onClick={() => {

                            const newGallery = [...formData.gallery_content];

                            newGallery.splice(idx, 1);

                            setFormData({ ...formData, gallery_content: newGallery });

                          }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">

                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>

                          </button>

                        </div>

                      ))}

                    </div>

                  </motion.div>

                )}

              </div>



              {/* Operational Details */}

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Operational Details</h3>

                    <p className="text-sm text-gray-400">Shop / business opening hours</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input type="checkbox" className="sr-only peer" checked={formData.custom_branding.show_hours} onChange={(e) => setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_hours: e.target.checked } })} />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_hours && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-3">

                    {Object.entries(formData.opening_hours).map(([day, hours]: [string, any]) => (

                      <div key={day} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">

                        <div className="w-24 capitalize text-gray-300 text-sm font-medium">{day}</div>

                        <div className="flex items-center gap-2 flex-1">

                          <input type="time" value={hours.open || ''} disabled={hours.closed} onChange={(e) => {

                            setFormData({

                              ...formData,

                              opening_hours: { ...formData.opening_hours, [day]: { ...hours, open: e.target.value } }

                            });

                          }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50" />

                          <span className="text-gray-500 text-sm">to</span>

                          <input type="time" value={hours.close || ''} disabled={hours.closed} onChange={(e) => {

                            setFormData({

                              ...formData,

                              opening_hours: { ...formData.opening_hours, [day]: { ...hours, close: e.target.value } }

                            });

                          }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50" />

                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">

                          <input type="checkbox" checked={hours.closed} onChange={(e) => {

                            setFormData({

                              ...formData,

                              opening_hours: { ...formData.opening_hours, [day]: { ...hours, closed: e.target.checked } }

                            });

                          }} className="rounded bg-black/20 border-white/20 text-blue-500 focus:ring-0" />

                          Closed

                        </label>

                      </div>

                    ))}

                  </motion.div>

                )}

              </div>



              {/* Physical Address */}

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Physical Address</h3>

                    <p className="text-sm text-gray-400">Display your address details</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input type="checkbox" className="sr-only peer" checked={formData.custom_branding.show_address} onChange={(e) => setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_address: e.target.checked } })} />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_address && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">Pincode</label>

                        <input type="text" value={formData.location_info?.pincode || ''} onChange={(e) => handlePincodeChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. 380001" maxLength={6} />

                        {isFetchingPincode && <span className="text-xs text-blue-400 mt-1 block">Fetching details...</span>}

                      </div>

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">State</label>

                        <input type="text" value={formData.location_info?.state || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), state: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="State" />

                      </div>

                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">City</label>

                        <input type="text" value={formData.location_info?.city || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), city: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="City" />

                      </div>

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">Village / Area</label>

                        {villages.length > 0 ? (

                          <select value={formData.location_info?.village || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), village: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">

                            <option value="">Select Village/Area</option>

                            {villages.map((v, i) => <option key={i} value={v} className="bg-gray-900">{v}</option>)}

                          </select>

                        ) : (

                          <input type="text" value={formData.location_info?.village || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), village: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="Village / Area" />

                        )}

                      </div>

                    </div>



                    <div>

                      <label className="text-sm text-gray-400 block mb-1">Full Physical Address</label>

                      <textarea rows={2} value={formData.location_info?.address || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), address: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="123 Business Street, City..." />

                    </div>

                  </motion.div>

                )}

              </div>



              {/* Google Maps Location */}

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Google Maps Location</h3>

                    <p className="text-sm text-gray-400">Embed a map to your office or store</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input type="checkbox" className="sr-only peer" checked={formData.custom_branding.show_location} onChange={(e) => setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_location: e.target.checked } })} />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_location && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">

                    <div>

                      <label className="text-sm text-gray-400 block mb-1">Google Maps URL</label>

                      <input type="url" value={formData.location_info?.map_url || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), map_url: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="https://goo.gl/maps/..." />

                    </div>

                    <div className="flex justify-between items-center mb-1">

                      <label className="text-sm text-gray-400 block">GPS Coordinates</label>

                      <button type="button" onClick={getCurrentLocation} disabled={isFetchingLocation} className={`text-xs ${isFetchingLocation ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'} transition-colors flex items-center gap-1`}>

                        {isFetchingLocation ? (

                          <span className="flex items-center gap-1">

                            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>

                            Fetching...

                          </span>

                        ) : (

                          <>

                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>

                            Get Current Location

                          </>

                        )}

                      </button>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">Latitude</label>

                        <input type="text" value={formData.location_info?.latitude || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), latitude: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. 23.0225" />

                      </div>

                      <div>

                        <label className="text-sm text-gray-400 block mb-1">Longitude</label>

                        <input type="text" value={formData.location_info?.longitude || ''} onChange={(e) => setFormData({ ...formData, location_info: { ...(formData.location_info || {}), longitude: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. 72.5714" />

                      </div>

                    </div>

                  </motion.div>

                )}

              </div>



              {/* Brochures PDF */}

              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">

                  <div>

                    <h3 className="font-semibold text-white">Brochures PDF</h3>

                    <p className="text-sm text-gray-400">Upload business brochures</p>

                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">

                    <input type="checkbox" className="sr-only peer" checked={formData.custom_branding.show_brochures} onChange={(e) => setFormData({ ...formData, custom_branding: { ...formData.custom_branding, show_brochures: e.target.checked } })} />

                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>

                  </label>

                </div>

                {formData.custom_branding.show_brochures && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">

                    <input type="file" accept=".pdf" onChange={async (e) => {

                      if (!e.target.files) return;

                      const file = e.target.files[0];

                      const formPayload = new FormData();

                      formPayload.append('file', file);

                      formPayload.append('type', 'document');

                      try {

                        const token = localStorage.getItem('card-setu-token');

                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {

                          method: 'POST',

                          headers: { 'Authorization': `Bearer ${token}` },

                          body: formPayload

                        });

                        const data = await res.json();

                        if (res.ok && data.url) {

                          setFormData({ ...formData, brochure_pdfs: [...formData.brochure_pdfs, data.url] });

                        }

                      } catch (err) {

                        console.error('Brochure upload failed', err);

                      }

                    }} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20" />

                    {formData.brochure_pdfs.length > 0 && (

                      <div className="space-y-2 mt-4">

                        {formData.brochure_pdfs.map((url: string, idx: number) => (

                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">

                            <div className="flex items-center gap-3">

                              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>

                              <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">Brochure_{idx + 1}.pdf</a>

                            </div>

                            <button type="button" onClick={() => {

                              const newPdfs = [...formData.brochure_pdfs];

                              newPdfs.splice(idx, 1);

                              setFormData({ ...formData, brochure_pdfs: newPdfs });

                            }} className="text-gray-400 hover:text-red-500 transition-colors">

                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>

                            </button>

                          </div>

                        ))}

                      </div>

                    )}

                  </motion.div>

                )}

              </div>

            </div>

          </motion.div>

        );

      case 5:

        return (

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

            <div>

              <h2 className="text-2xl font-bold mb-2">{id ? 'Theme & Save' : 'Theme & Complete'}</h2>

              <p className="text-gray-400 mb-6">{id ? 'Choose your brand color and save your changes!' : 'Choose your brand color and generate your card!'}</p>

            </div>



            <div>

              <h3 className="text-lg font-semibold text-white mb-3">Select Brand Colors</h3>

              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">

                {[

                  { id: 'blue', primary: '#3b82f6', secondary: '#eff6ff' },

                  { id: 'indigo', primary: '#6366f1', secondary: '#eef2ff' },

                  { id: 'purple', primary: '#a855f7', secondary: '#faf5ff' },

                  { id: 'rose', primary: '#f43f5e', secondary: '#fff1f2' },

                  { id: 'orange', primary: '#f97316', secondary: '#fff7ed' },

                  { id: 'green', primary: '#22c55e', secondary: '#f0fdf4' },

                  { id: 'teal', primary: '#14b8a6', secondary: '#f0fdfa' },

                  { id: 'cyan', primary: '#06b6d4', secondary: '#ecfeff' },

                  { id: 'yellow', primary: '#eab308', secondary: '#fefce8' },

                  { id: 'dark', primary: '#1f2937', secondary: '#f3f4f6' },

                ].map((pair) => (

                  <div

                    key={pair.id}

                    onClick={() => setFormData({

                      ...formData,

                      custom_branding: {

                        ...formData.custom_branding,

                        theme_color: pair.primary,

                        primary_color: pair.primary,

                        secondary_color: pair.secondary

                      }

                    })}

                    className={`h-10 w-10 rounded-full cursor-pointer border-2 transition-transform overflow-hidden relative ${

                      (formData.custom_branding?.primary_color === pair.primary || formData.custom_branding?.theme_color === pair.primary || formData.custom_branding?.theme_color === pair.id) ? 'border-white scale-110 shadow-lg ring-2 ring-white/20' : 'border-white/10 hover:scale-105'

                    }`}

                    title={pair.id.charAt(0).toUpperCase() + pair.id.slice(1)}

                  >

                    <div className="absolute inset-y-0 left-0 w-1/2 h-full" style={{ backgroundColor: pair.primary }}></div>

                    <div className="absolute inset-y-0 right-0 w-1/2 h-full" style={{ backgroundColor: pair.secondary }}></div>

                  </div>

                ))}

              </div>



              <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/10">

                <div className="flex flex-col">

                  <label className="text-sm font-medium text-white mb-2">Custom Primary</label>

                  <div className="flex items-center gap-2">

                    <input

                      type="color"

                      value={formData.custom_branding.primary_color || (formData.custom_branding.theme_color?.startsWith('#') ? formData.custom_branding.theme_color : '#3b82f6')}

                      onChange={(e) => setFormData({

                        ...formData,

                        custom_branding: {

                          ...formData.custom_branding,

                          primary_color: e.target.value,

                          theme_color: e.target.value

                        }

                      })}

                      className="w-9 h-9 rounded-md cursor-pointer border-0 p-0 bg-transparent shadow-sm"

                    />

                    <span className="text-xs text-gray-400 font-mono uppercase">

                      {formData.custom_branding.primary_color || (formData.custom_branding.theme_color?.startsWith('#') ? formData.custom_branding.theme_color : '#3B82F6')}

                    </span>

                  </div>

                </div>

                

                <div className="w-[1px] h-10 bg-white/10"></div>

                

                <div className="flex flex-col">

                  <label className="text-sm font-medium text-white mb-2">Custom Secondary</label>

                  <div className="flex items-center gap-2">

                    <input

                      type="color"

                      value={formData.custom_branding.secondary_color || '#eff6ff'}

                      onChange={(e) => setFormData({

                        ...formData,

                        custom_branding: {

                          ...formData.custom_branding,

                          secondary_color: e.target.value

                        }

                      })}

                      className="w-9 h-9 rounded-md cursor-pointer border-0 p-0 bg-transparent shadow-sm"

                    />

                    <span className="text-xs text-gray-400 font-mono uppercase">

                      {formData.custom_branding.secondary_color || '#EFF6FF'}

                    </span>

                  </div>

                </div>

              </div>

            </div>



            <div className="p-6 bg-[#0B1528]/50 backdrop-blur-xl rounded-2xl border border-white/10 space-y-6">

              <div className="flex items-center gap-6">

                <div

                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden"

                  style={{

                    backgroundColor: formData.custom_branding.theme_color.startsWith('#') ? formData.custom_branding.theme_color : (formData.custom_branding.theme_color === 'blue' ? '#3b82f6' : formData.custom_branding.theme_color === 'indigo' ? '#6366f1' : formData.custom_branding.theme_color === 'purple' ? '#a855f7' : formData.custom_branding.theme_color === 'green' ? '#22c55e' : formData.custom_branding.theme_color === 'rose' ? '#f43f5e' : '#f97316'),

                    boxShadow: `0 10px 15px -3px ${formData.custom_branding.theme_color.startsWith('#') ? formData.custom_branding.theme_color : (formData.custom_branding.theme_color === 'blue' ? '#3b82f6' : formData.custom_branding.theme_color === 'indigo' ? '#6366f1' : formData.custom_branding.theme_color === 'purple' ? '#a855f7' : formData.custom_branding.theme_color === 'green' ? '#22c55e' : formData.custom_branding.theme_color === 'rose' ? '#f43f5e' : '#f97316')}4D`

                  }}

                >

                  {formData.personal_info?.profile_image ? <img src={formData.personal_info.profile_image} className="w-full h-full object-cover" /> : (formData.personal_info?.name?.charAt(0).toUpperCase() || 'U')}

                </div>

                <div>

                  <h3 className="text-2xl font-bold text-white">{formData.personal_info?.name || 'Your Name'}</h3>

                  <p

                    className="font-medium"

                    style={{ color: formData.custom_branding.theme_color.startsWith('#') ? formData.custom_branding.theme_color : (formData.custom_branding.theme_color === 'blue' ? '#60a5fa' : formData.custom_branding.theme_color === 'indigo' ? '#818cf8' : formData.custom_branding.theme_color === 'purple' ? '#c084fc' : formData.custom_branding.theme_color === 'green' ? '#4ade80' : formData.custom_branding.theme_color === 'rose' ? '#fb7185' : '#fb923c') }}

                  >{formData.personal_info?.designation || 'Your Designation'}</p>

                  

                  {formData.category_id && (

                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-medium bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 w-fit">

                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H8a2 2 0 00-2 2v16z"></path></svg>

                      {categories.find(c => c.id.toString() === formData.category_id)?.name}

                      {formData.subcategory_id && ` › ${categories.find(c => c.id.toString() === formData.category_id)?.children?.find((sc: any) => sc.id.toString() === formData.subcategory_id)?.name}`}

                    </p>

                  )}

                  

                  <p className="text-gray-400 text-sm mt-1">{formData.company_details?.company_name}</p>

                </div>

              </div>



              <div className="grid grid-cols-3 gap-3">

                {['Call', 'WhatsApp', 'Email'].map((action) => (

                  <div

                    key={action}

                    className="p-3 bg-white/5 rounded-xl border border-white/10 text-center cursor-pointer hover:bg-white/10 transition-colors"

                  >

                    <div

                      className="text-sm font-medium"

                      style={{ color: formData.custom_branding.theme_color.startsWith('#') ? formData.custom_branding.theme_color : (formData.custom_branding.theme_color === 'blue' ? '#3b82f6' : formData.custom_branding.theme_color === 'indigo' ? '#6366f1' : formData.custom_branding.theme_color === 'purple' ? '#a855f7' : formData.custom_branding.theme_color === 'green' ? '#22c55e' : formData.custom_branding.theme_color === 'rose' ? '#f43f5e' : '#f97316') }}

                    >

                      {action}

                    </div>

                  </div>

                ))}

              </div>



              <button

                className="w-full py-3 rounded-xl text-white font-bold transition-transform hover:scale-[1.02]"

                style={{

                  backgroundColor: formData.custom_branding.theme_color.startsWith('#') ? formData.custom_branding.theme_color : (formData.custom_branding.theme_color === 'blue' ? '#3b82f6' : formData.custom_branding.theme_color === 'indigo' ? '#6366f1' : formData.custom_branding.theme_color === 'purple' ? '#a855f7' : formData.custom_branding.theme_color === 'green' ? '#22c55e' : formData.custom_branding.theme_color === 'rose' ? '#f43f5e' : '#f97316'),

                  boxShadow: `0 4px 14px 0 ${formData.custom_branding.theme_color.startsWith('#') ? formData.custom_branding.theme_color : (formData.custom_branding.theme_color === 'blue' ? '#3b82f6' : formData.custom_branding.theme_color === 'indigo' ? '#6366f1' : formData.custom_branding.theme_color === 'purple' ? '#a855f7' : formData.custom_branding.theme_color === 'green' ? '#22c55e' : formData.custom_branding.theme_color === 'rose' ? '#f43f5e' : '#f97316')}4D`

                }}

              >

                Save Contact

              </button>

            </div>

          </motion.div>

        );

      default:

        return null;

    }

  };



  return (

    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-[#030712]">



      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col h-full border-r border-white/5 overflow-y-auto no-scrollbar">

        <div className="p-6 max-w-4xl mx-auto w-full">

          <div className="mb-8">

            <button onClick={() => router.push('/dashboard/cards')} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors mb-6">

              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>

              Back to Cards

            </button>



            <div className="flex items-center justify-between mb-2">

              {Array.from({ length: totalSteps }).map((_, index) => (

                <div key={index} className="flex-1 flex flex-col items-center relative">

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-300 ${

                    currentStep > index + 1 ? 'bg-green-500 text-white' : currentStep === index + 1 ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : 'bg-white/10 text-gray-500'

                  }`}>

                    {currentStep > index + 1 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> : index + 1}

                  </div>

                  {index < totalSteps - 1 && <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 transition-all duration-500 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-white/10'}`} />}

                </div>

              ))}

            </div>

          </div>



          <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">

            {error && (

              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">

                {error}

              </div>

            )}

            <AnimatePresence mode="wait">

              {renderStepContent()}

            </AnimatePresence>



            <div className="flex justify-between mt-12 pt-6 border-t border-white/5">

              <button onClick={handlePrev} disabled={currentStep === 1 || isSubmitting} className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${currentStep === 1 ? 'opacity-0 cursor-default' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>

                Back

              </button>



              {currentStep < totalSteps ? (

                <button onClick={handleNext} disabled={currentStep === 1 && !formData.card_type} className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${currentStep === 1 && !formData.card_type ? 'bg-blue-500/50 text-white/50 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20'}`}>

                  Next Step

                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (id ? 'Saving...' : 'Generating...') : (id ? 'Save Changes' : 'Finish & Go to Dashboard')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Preview */}
      <div className="hidden md:flex w-1/2 lg:w-2/5 bg-black/50 items-center justify-center p-8 overflow-hidden">
        <div className="w-[320px] h-[650px] bg-black rounded-[48px] border-[3.5px] border-neutral-800/80 ring-1 ring-white/15 overflow-hidden shadow-2xl relative flex flex-col">
          {/* Dynamic Island Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-center border border-neutral-800/50 shadow-inner">
            {/* Camera lens highlight */}
            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#0a0f1d] border border-neutral-900" />
            <div className="absolute right-[13px] w-0.5 h-0.5 rounded-full bg-blue-500/30" />
          </div>

          {/* Dynamic Colors & Branding */}
          {(() => {
            const themeName = formData.custom_branding?.theme_color || 'blue';
            const primaryColor = formData.custom_branding?.primary_color || getHexColor(themeName);
            const secondaryColor = formData.custom_branding?.secondary_color || '#eff6ff';
            const isDark = formData.custom_branding?.dark_mode_enabled ?? true;
            const primary15 = hexToRgba(primaryColor, 0.15);
            const primary30 = hexToRgba(primaryColor, 0.3);

            const companyName = formData.company_details?.company_name || (formData.personal_info as any)?.company || 'Independent';

            const personalInfo   = formData.personal_info || {};
            const socialLinks    = formData.social_links || {};
            const paymentInfo    = formData.payment_info || {};
            const companyDetails = formData.company_details || {};
            const customBranding = (formData.custom_branding as any) || {};

            const proprietorDetails  = Array.isArray(formData.proprietor_details) ? formData.proprietor_details : [];
            const galleryContent     = Array.isArray(formData.gallery_content) ? formData.gallery_content : [];
            const openingHours       = formData.opening_hours || {};
            const locationInfo       = formData.location_info || {};
            const brochurePdfs       = Array.isArray(formData.brochure_pdfs) ? formData.brochure_pdfs : [];

            const showSocial      = customBranding.show_social      !== false;
            const showCompany     = customBranding.show_company     !== false;
            const showPayment     = customBranding.show_payment     !== false;
            const showProprietor  = customBranding.show_proprietor  !== false;
            const showGallery     = customBranding.show_gallery     !== false;
            const showHours       = customBranding.show_hours       !== false;
            const showAddress     = customBranding.show_address     !== false;
            const showLocation    = customBranding.show_location    !== false;
            const showBrochures   = customBranding.show_brochures   !== false;

            const phone    = socialLinks.phone || '';
            const whatsapp = socialLinks.whatsapp || '';
            const email    = socialLinks.email || '';

            const cleanedPhone    = phone    ? String(phone).replace(/[^\d+]/g, '')    : '';
            const cleanedWhatsapp = whatsapp ? String(whatsapp).replace(/[^\d]/g, '')  : '';

            const fullAddress =
              companyDetails.address ||
              [locationInfo.address, locationInfo.village, locationInfo.city, locationInfo.state, locationInfo.pincode]
                .filter(Boolean)
                .join(', ');

            const hasPayment = !!(paymentInfo.upi_id || paymentInfo.bank_name || paymentInfo.account_number || paymentInfo.qr_path);
            const hasLocationBlock = showLocation && (locationInfo.city || locationInfo.state || locationInfo.map_url);
            const hasBusinessBlock = showCompany && (companyDetails.company_name || companyDetails.gst || companyDetails.website || (showAddress && fullAddress));
            
            const hasProprietorBlock = showProprietor && proprietorDetails.length > 0 && proprietorDetails.some((p: any) => p.name);
            const hasGalleryBlock = showGallery && galleryContent.length > 0;
            const hasHoursBlock = showHours && Object.keys(openingHours).length > 0;
            const hasBrochuresBlock = showBrochures && brochurePdfs.length > 0;

            const surface       = isDark ? 'bg-[#0f0f13]' : 'bg-white';
            const surfaceSoft   = isDark ? 'bg-white/[0.04]' : 'bg-slate-50';
            const borderSoft    = isDark ? 'border-white/10' : 'border-slate-200';
            const ringSoft      = isDark ? 'ring-white/10' : 'ring-slate-200';
            const cardStyle     = `${surfaceSoft} ring-1 ${ringSoft} transition-all duration-200 rounded-2xl`;

            const textMain      = isDark ? 'text-slate-100' : 'text-slate-900';
            const textMuted     = isDark ? 'text-slate-400' : 'text-slate-500';
            const textSubtle    = isDark ? 'text-slate-300' : 'text-slate-600';

            const PreviewIcon = {
              Phone: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                </svg>
              ),
              Mail: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
              ),
              Whatsapp: (p: any) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                </svg>
              ),
              Save: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              ),
              Globe: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
              MapPin: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              Building: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                </svg>
              ),
              Wallet: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h12v4" />
                  <path d="M3 6v12a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-4h-6a2 2 0 0 1 0-4h6" />
                </svg>
              ),
              Check: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ),
              Download: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              ),
              QrCode: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              ),
              Search: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ),
              ShoppingCart: (p: any) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              ),
              Facebook: (p: any) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/>
                </svg>
              ),
              Twitter: (p: any) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              ),
              Instagram: (p: any) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16-1.06.36-2.23.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13 5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0z"/>
                  <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                  <circle cx="18.41" cy="5.59" r="1.44"/>
                </svg>
              ),
              LinkedIn: (p: any) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
                </svg>
              ),
              YouTube: (p: any) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.4.52A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.13c1.9.52 9.4.52 9.4.52s7.5 0 9.4-.52a3 3 0 0 0 2.1-2.13A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.57V8.43L15.82 12 9.6 15.57z"/>
                </svg>
              ),
            };

            const RenderSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
              <div className="mt-4 text-left">
                <h4 className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${textMuted} mb-1.5`}>{title}</h4>
                {children}
              </div>
            );

            const RenderInfoRow = ({
              icon,
              label,
              value,
              href,
              tint,
            }: {
              icon: React.ReactNode;
              label: string;
              value: React.ReactNode;
              href?: string;
              tint?: string;
            }) => (
              <div className="group flex items-center justify-between gap-2.5 rounded-xl p-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-black/20' : 'bg-slate-100'}`}>
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                    {href ? (
                      <span className="mt-0.5 block truncate text-[11px] font-medium" style={{ color: tint }}>
                        {value}
                      </span>
                    ) : (
                      <div className={`mt-0.5 break-words text-[11px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</div>
                    )}
                  </div>
                </div>
              </div>
            );

            const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const todayHours: any = Object.entries(openingHours).find(([d]) => d.toLowerCase() === todayName)?.[1];
            const isOpenNow = todayHours && !todayHours.closed;

            return (
              <div 
                id="simulated-phone-scroll"
                className={`flex-1 overflow-y-auto pb-20 relative transition-colors duration-300 ${
                  isDark ? 'bg-[#08080C] text-slate-100' : 'bg-slate-100 text-slate-900'
                }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style dangerouslySetInnerHTML={{__html: `
                  #simulated-phone-scroll::-webkit-scrollbar {
                    display: none !important;
                  }
                `}} />
                {/* Simulated Fixed Backdrop Blob */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute -top-16 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full opacity-20 blur-2xl"
                    style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${primaryColor}, transparent 60%)` }}
                  />
                </div>

                {/* Simulated card wrapper */}
                <div className={`relative m-2.5 mt-4 rounded-3xl border overflow-hidden backdrop-blur ${
                  isDark ? 'bg-[#0f0f13] border-white/10 shadow-black/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  {/* ---- Simulated HERO R3F ---- */}
                  <div className="relative h-28 w-full overflow-hidden">
                    <Hero3DBackground primaryColor={primaryColor} secondaryColor={secondaryColor} />
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] mix-blend-overlay" />
                    
                    {/* Simulated live actions at top of preview */}
                    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-2">
                      <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[8px] font-medium text-white backdrop-blur-md ring-1 ring-white/10">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        1,042 views
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md">
                          {isDark ? (
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
                          ) : (
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---- Simulated PROFILE ---- */}
                  <div className="relative px-4 pb-4">
                    <div className="-mt-10 flex flex-col items-center text-center">
                      <div className="relative">
                        <div
                          className="absolute -inset-0.5 rounded-full opacity-60 blur-sm"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        />
                        <div className={`relative z-10 h-16 w-16 overflow-hidden rounded-full ring-2 shadow-lg ${
                          isDark ? 'ring-[#12121A] bg-[#12121A]' : 'ring-white bg-white'
                        }`}>
                          {formData.personal_info?.profile_image ? (
                            <img src={formData.personal_info.profile_image} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            <div 
                              className="flex h-full w-full items-center justify-center text-2xl font-bold text-white" 
                              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                            >
                              {(formData.personal_info?.name || 'U').trim().charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className={`absolute bottom-0 right-0 z-20 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 ring-1 ${isDark ? 'ring-[#12121A]' : 'ring-white'}`}>
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      </div>

                      {formData.personal_info?.name && (
                        <h2 className={`mt-2 text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.personal_info.name}</h2>
                      )}
                      {formData.personal_info?.designation && (
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formData.personal_info.designation}</p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                        {formData.category_id && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            isDark ? 'bg-white/5 text-slate-300 border-white/5' : 'bg-slate-50 text-slate-600 border-slate-100'
                          } border`}>
                            <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M7 7h.01M6 20a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H8a2 2 0 00-2 2v16z" /></svg>
                            {categories.find(c => c.id.toString() === formData.category_id)?.name}
                          </span>
                        )}
                        {formData.custom_branding?.show_company && companyName && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            isDark ? 'bg-white/5 text-slate-300 border-white/5' : 'bg-slate-50 text-slate-600 border-slate-100'
                          } border`}>
                            <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /></svg>
                            {companyName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ---- Simulated QUICK ACTIONS ---- */}
                    <div className="mt-4 grid grid-cols-4 gap-1.5">
                      <div className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 border ${
                        isDark ? 'bg-white/[0.04] border-white/5' : 'bg-slate-50 border-slate-100'
                      } ${!cleanedPhone ? 'opacity-40' : 'opacity-80'}`}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(primaryColor, 0.14), color: primaryColor }}>
                          <PreviewIcon.Phone className="w-4 h-4" />
                        </span>
                        <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Call</span>
                      </div>

                      <div className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 border ${
                        isDark ? 'bg-white/[0.04] border-white/5' : 'bg-slate-50 border-slate-100'
                      } ${!cleanedWhatsapp ? 'opacity-40' : 'opacity-80'}`}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(primaryColor, 0.14), color: primaryColor }}>
                          <PreviewIcon.Whatsapp className="w-4 h-4" />
                        </span>
                        <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>WhatsApp</span>
                      </div>

                      <div className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 border ${
                        isDark ? 'bg-white/[0.04] border-white/5' : 'bg-slate-50 border-slate-100'
                      } ${!email ? 'opacity-40' : 'opacity-80'}`}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(primaryColor, 0.14), color: primaryColor }}>
                          <PreviewIcon.Mail className="w-4 h-4" />
                        </span>
                        <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Email</span>
                      </div>

                      <div className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 border ${
                        isDark ? 'bg-white/[0.04] border-white/5' : 'bg-slate-50 border-slate-100'
                      } opacity-80`}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(primaryColor, 0.14), color: primaryColor }}>
                          <PreviewIcon.Save className="w-4 h-4" />
                        </span>
                        <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Save</span>
                      </div>
                    </div>

                    {/* ---- Simulated ABOUT ---- */}
                    {formData.personal_info?.bio && (
                      <RenderSection title="About">
                        <div className={`relative rounded-2xl p-3 border ${
                          isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-100'
                        } overflow-hidden`}>
                          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})` }} />
                          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'} pl-1.5 whitespace-pre-wrap`}>
                            {formData.personal_info.bio}
                          </p>
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated SOCIAL LINKS ---- */}
                    {showSocial && Object.values(socialLinks).some(Boolean) && (
                      <div className="mt-4 flex flex-col items-center gap-1.5">
                        <p className={`text-[8px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>Connect</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {socialLinks.linkedin && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-white/10" style={{ backgroundColor: '#0A66C2' }}>
                              <PreviewIcon.LinkedIn className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {socialLinks.instagram && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-white/10" style={{ backgroundColor: '#E1306C' }}>
                              <PreviewIcon.Instagram className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {socialLinks.facebook && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-white/10" style={{ backgroundColor: '#1877F2' }}>
                              <PreviewIcon.Facebook className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {socialLinks.twitter && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-white/10" style={{ backgroundColor: '#0F1419' }}>
                              <PreviewIcon.Twitter className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {socialLinks.youtube && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-white/10" style={{ backgroundColor: '#FF0000' }}>
                              <PreviewIcon.YouTube className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ---- Simulated BUSINESS DETAILS ---- */}
                    {hasBusinessBlock && (
                      <RenderSection title="Business">
                        <div className={`flex flex-col rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/5 divide-white/5' : 'bg-slate-50 border-slate-200 divide-slate-200'} divide-y`}>
                          {showCompany && companyDetails.company_name && (
                            <RenderInfoRow
                              icon={<PreviewIcon.Building className="h-4 w-4" style={{ color: primaryColor }} />}
                              label="Company"
                              value={companyDetails.company_name}
                            />
                          )}
                          {showCompany && companyDetails.gst && (
                            <RenderInfoRow
                              icon={<PreviewIcon.Wallet className="h-4 w-4" style={{ color: primaryColor }} />}
                              label="GST"
                              value={
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span>{companyDetails.gst}</span>
                                  <span className="flex items-center gap-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-1 py-0.25 text-[7px] font-bold">
                                    <PreviewIcon.Check className="w-1.5 h-1.5 text-green-400" />
                                    Verified
                                  </span>
                                </div>
                              }
                            />
                          )}
                          {showCompany && companyDetails.website && (
                            <RenderInfoRow
                              icon={<PreviewIcon.Globe className="h-4 w-4" style={{ color: primaryColor }} />}
                              label="Website"
                              value={companyDetails.website}
                              href={companyDetails.website}
                              tint={primaryColor}
                            />
                          )}
                          {showCompany && fullAddress && (
                            <RenderInfoRow
                              icon={<PreviewIcon.MapPin className="h-4 w-4" style={{ color: primaryColor }} />}
                              label="Address"
                              value={fullAddress}
                            />
                          )}
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated PROPRIETORS & TEAM ---- */}
                    {hasProprietorBlock && (
                      <RenderSection title="Proprietor & Team">
                        <div className="grid grid-cols-1 gap-2">
                          {proprietorDetails.map((proprietor: any, idx: number) => (
                            <div key={idx} className={`p-3 rounded-xl border ${
                              isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'
                            } flex flex-col gap-2`}>
                              <div className="flex items-center gap-2.5">
                                {proprietor.image ? (
                                  <img src={proprietor.image} alt={proprietor.name} className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                                ) : (
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-white/10 text-white/50' : 'bg-slate-200 text-slate-500'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h5 className={`text-[11px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{proprietor.name}</h5>
                                  {proprietor.designation && <p className="text-[9px] font-medium truncate" style={{ color: primaryColor }}>{proprietor.designation}</p>}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {proprietor.phone && (
                                  <div className={`flex-1 flex items-center justify-center gap-1 py-1 rounded bg-black/10 text-[8px] font-bold ${textSubtle}`}>
                                    <PreviewIcon.Phone className="w-2 h-2" />
                                    Call
                                  </div>
                                )}
                                {proprietor.whatsapp && (
                                  <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-white text-[8px] font-bold" style={{ backgroundColor: primaryColor }}>
                                    <PreviewIcon.Whatsapp className="w-2 h-2" />
                                    WhatsApp
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated LOCATION ---- */}
                    {hasLocationBlock && (
                      <RenderSection title="Location">
                        <div className={`rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-start gap-2.5 p-3">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundImage: primary15, color: primaryColor }}>
                              <PreviewIcon.MapPin className="h-3 w-3" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold truncate">
                                {[locationInfo.village, locationInfo.city].filter(Boolean).join(', ') || 'Location'}
                              </p>
                              <p className={`mt-0.5 text-[9px] ${textMuted} truncate`}>
                                {[locationInfo.state, locationInfo.pincode].filter(Boolean).join(' · ')}
                              </p>
                              {locationInfo.map_url && (
                                <div className="mt-1 flex items-center gap-1 text-[9px] font-medium" style={{ color: primaryColor }}>
                                  Open in maps
                                  <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated GALLERY ---- */}
                    {hasGalleryBlock && (
                      <RenderSection title="Gallery">
                        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                          {galleryContent.map((url: string, idx: number) => (
                            <div key={idx} className="flex-none w-[90px] aspect-[4/3] overflow-hidden rounded-lg border border-white/10 shrink-0">
                              <img src={url} alt={`Gallery item ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated BROCHURES ---- */}
                    {hasBrochuresBlock && (
                      <RenderSection title="Brochures & Documents">
                        <div className="space-y-2">
                          {brochurePdfs.map((url: string, idx: number) => (
                            <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border ${
                              isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded flex items-center justify-center bg-red-500/10 text-red-500 shrink-0">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                                </div>
                                <div className="min-w-0">
                                  <p className={`font-semibold text-[10px] truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>Brochure {idx + 1}</p>
                                  <p className={`text-[8px] ${textMuted}`}>PDF Document</p>
                                </div>
                              </div>
                              <PreviewIcon.Download className="w-3 h-3 text-slate-400" />
                            </div>
                          ))}
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated OPENING HOURS ---- */}
                    {showHours && hasHoursBlock && (
                      <RenderSection title="Opening Hours">
                        <div className="mb-2 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold ${
                            isOpenNow
                              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {isOpenNow ? `Open Now · ${todayHours.open || '09:00'} – ${todayHours.close || '18:00'}` : 'Closed Now'}
                          </span>
                        </div>
                        <div className={`rounded-xl divide-y text-[10px] ${isDark ? 'bg-white/[0.03] divide-white/5 border border-white/5' : 'bg-slate-50 divide-slate-100 border border-slate-200'}`}>
                          {Object.entries(openingHours).map(([day, hours]: [string, any]) => {
                            const isToday = day.toLowerCase() === todayName;
                            return (
                              <div key={day} className={`flex justify-between items-center px-3 py-1.5 ${isToday ? (isDark ? 'bg-white/[0.04]' : 'bg-white') : ''}`}>
                                <span className={`capitalize font-medium flex items-center gap-1 ${isToday ? (isDark ? 'text-white' : 'text-slate-900') : textMuted}`}>
                                  {day}
                                  {isToday && <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>Today</span>}
                                </span>
                                {hours.closed ? (
                                  <span className="text-[8px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Closed</span>
                                ) : (
                                  <span className={`font-medium ${isToday ? (isDark ? 'text-white' : 'text-slate-900') : textSubtle}`}>
                                    {hours.open || '09:00'} – {hours.close || '18:00'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated PAYMENT (PAY ME) ---- */}
                    {showPayment && hasPayment && (
                      <RenderSection title="Pay Me">
                        <div className="grid grid-cols-2 gap-2">
                          {(paymentInfo.bank_name || paymentInfo.account_number || paymentInfo.ifsc_code) && (
                            <div className={`flex flex-col items-start justify-center gap-1 rounded-xl p-3 text-left border ${
                              isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'
                            }`}>
                              <div className="flex items-center gap-1.5">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-600 animate-pulse">
                                  <PreviewIcon.Wallet className="h-3 w-3" />
                                </span>
                                <span className={`text-[10px] font-bold ${textMain}`}>Bank</span>
                              </div>
                              <span className={`text-[8px] ${textMuted}`}>Pay via Bank Transfer</span>
                            </div>
                          )}
                          {(paymentInfo.qr_path || paymentInfo.upi_id || paymentInfo.phonepe) && (
                            <div className={`flex flex-col items-start justify-center gap-1 rounded-xl p-3 text-left border ${
                              isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'
                            }`}>
                              <div className="flex items-center gap-1.5">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-600 animate-pulse">
                                  <PreviewIcon.QrCode className="h-3 w-3" />
                                </span>
                                <span className={`text-[10px] font-bold ${textMain}`}>QR / UPI</span>
                              </div>
                              <span className={`text-[8px] ${textMuted}`}>Scan QR or UPI</span>
                            </div>
                          )}
                        </div>
                      </RenderSection>
                    )}

                    {/* ---- Simulated PRODUCTS (SHOP CATALOG) ---- */}
                    <div className="mt-4 text-left border-t border-dashed border-gray-500/20 pt-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <h4 className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>Our Products</h4>
                        <span className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>2 items</span>
                      </div>
                      <div className="mb-2.5 relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <PreviewIcon.Search className="h-3 w-3 text-slate-400" />
                        </div>
                        <div className={`w-full rounded-xl py-1.5 pl-8 pr-3 text-[10px] ${
                          isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          Search products...
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 1, name: 'Premium Product A', price: 999, desc: 'Highest quality standard item.' },
                          { id: 2, name: 'Exclusive Bundle B', price: 2499, desc: 'All-in-one corporate solutions.' }
                        ].map(prod => (
                          <div key={prod.id} className={`flex flex-col overflow-hidden rounded-xl border ${
                            isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200'
                          }`}>
                            <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 shrink-0">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 opacity-40"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            </div>
                            <div className="flex flex-1 flex-col p-2">
                              <h5 className={`text-[10px] font-bold ${textMain} truncate`}>{prod.name}</h5>
                              <p className={`text-[8px] mt-0.5 line-clamp-1 ${textMuted}`}>{prod.desc}</p>
                              <div className="mt-1.5 flex items-center justify-between">
                                <p className={`text-[10px] font-extrabold ${textMain}`}>₹{prod.price}</p>
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-white shadow shadow-emerald-500/20">
                                  <PreviewIcon.ShoppingCart className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ---- Simulated INQUIRY ---- */}
                    {customBranding.show_lead_form !== false && (
                      <RenderSection title="Send an Inquiry">
                        <div className={`p-3.5 rounded-xl border ${
                          isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className={`w-full h-6 rounded-lg mb-1.5 border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'}`} />
                          <div className={`w-full h-6 rounded-lg mb-1.5 border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'}`} />
                          <div className={`w-full h-12 rounded-lg mb-1.5 border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'}`} />
                          <div className="w-full h-7 rounded-xl flex items-center justify-center font-bold text-[10px] text-white transition active:scale-95 shadow-md" style={{ backgroundColor: primaryColor }}>
                            Submit Inquiry
                          </div>
                        </div>
                      </RenderSection>
                    )}

                    {/* Footer */}
                    <div className={`mt-6 text-center text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Powered by <span className="font-semibold" style={{ color: primaryColor }}>Card Setu</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}





