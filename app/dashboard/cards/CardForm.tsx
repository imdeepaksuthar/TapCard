'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

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
        const res = await fetch(`http://localhost:8000/api/verify-pincode/${pincode}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0]?.Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
          const postOffices = data[0].PostOffice;
          const state = postOffices[0].State;
          const city = postOffices[0].District;
          const villageList = postOffices.map((po: any) => po.Name);

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
        console.error("Error fetching pincode", err);
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
      const res = await fetch('http://localhost:8000/api/upload', {
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
      const res = await fetch('http://localhost:8000/api/upload', {
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
      const res = await fetch('http://localhost:8000/api/upload', {
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
        router.push(`/dashboard/cards/edit/${res.card.id}`);
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
                              <input type="text" value={proprietor.name} onChange={(e) => {
                                const newDetails = [...formData.proprietor_details];
                                newDetails[index].name = e.target.value;
                                setFormData({ ...formData, proprietor_details: newDetails });
                              }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="John Doe" />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400 block mb-1">Designation</label>
                              <input type="text" value={proprietor.designation} onChange={(e) => {
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
                            <input type="email" value={proprietor.email} onChange={(e) => {
                              const newDetails = [...formData.proprietor_details];
                              newDetails[index].email = e.target.value;
                              setFormData({ ...formData, proprietor_details: newDetails });
                            }} className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${validationErrors[`proprietor_${index}_email`] ? 'border-red-500/80 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-blue-500'}`} placeholder="john@example.com" />
                            {validationErrors[`proprietor_${index}_email`] && <p className="text-xs text-red-500 mt-1">{validationErrors[`proprietor_${index}_email`]}</p>}
                          </div>
                          <div>
                            <label className="text-sm text-gray-400 block mb-1">Phone Number</label>
                            <input type="tel" value={proprietor.phone} onChange={(e) => {
                              const newDetails = [...formData.proprietor_details];
                              newDetails[index].phone = e.target.value;
                              setFormData({ ...formData, proprietor_details: newDetails });
                            }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="+1234567890" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-400 block mb-1">WhatsApp Number</label>
                            <input type="tel" value={proprietor.whatsapp} onChange={(e) => {
                              const newDetails = [...formData.proprietor_details];
                              newDetails[index].whatsapp = e.target.value;
                              setFormData({ ...formData, proprietor_details: newDetails });
                            }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="+1234567890" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400 block mb-1">Date of Birth</label>
                            <input type="date" value={proprietor.dob} onChange={(e) => {
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
                          const res = await fetch('http://localhost:8000/api/upload', {
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
                        const res = await fetch('http://localhost:8000/api/upload', {
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
                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? (id ? 'Saving...' : 'Generating...') : (id ? 'Save Changes' : 'Finish & Open Builder')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Preview */}
      <div className="hidden md:flex w-1/2 lg:w-2/5 bg-black/50 items-center justify-center p-8 overflow-hidden">
        <div className="w-[320px] h-[650px] bg-white rounded-[40px] border-[8px] border-[#1f2937] overflow-hidden shadow-2xl relative flex flex-col">
          <div className="h-6 bg-black/10 w-full absolute top-0 z-20 flex justify-center pt-1">
            <div className="w-20 h-4 bg-black rounded-b-xl" />
          </div>

          <div 
            className={`flex-1 overflow-y-auto no-scrollbar pb-20 ${formData.custom_branding?.dark_mode_enabled ? 'dark bg-[#0F0F14] text-[#F5F5F8]' : 'bg-[#FFFFFF] text-[#0F0F14]'}`}
          >
            <div className="relative h-32 w-full bg-[#1A1A2E] overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)', backgroundSize: '15px 15px', backgroundPosition: '0 0, 7.5px 7.5px' }} />
            </div>

            <div className="px-4 relative -mt-12">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg dark:border-gray-800">
                    {formData.personal_info?.profile_image ? (
                      <img src={formData.personal_info.profile_image} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-3xl font-bold text-gray-500 dark:bg-gray-700">
                        {formData.personal_info?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                
                <h1 className="mt-2 text-lg font-bold">{formData.personal_info?.name || 'Your Name'}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formData.personal_info?.designation || 'Your Designation'}</p>
                
                {formData.category_id && (
                  <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1 font-medium bg-black/20 px-2 py-0.5 rounded-full border border-white/5 w-fit mx-auto">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H8a2 2 0 00-2 2v16z"></path></svg>
                    {categories.find(c => c.id.toString() === formData.category_id)?.name}
                    {formData.subcategory_id && ` › ${categories.find(c => c.id.toString() === formData.category_id)?.children?.find((sc: any) => sc.id.toString() === formData.subcategory_id)?.name}`}
                  </p>
                )}
                
                <div className="mt-2 flex gap-1">
                  {formData.company_details?.company_name && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${formData.custom_branding?.dark_mode_enabled ? 'bg-[#1A1A24] text-gray-300' : 'bg-[#F5F5F8] text-gray-700'}`}>
                      {formData.company_details.company_name}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#534AB7] text-white">
                    NFC
                  </span>
                </div>
              </div>

              <div className={`mt-4 grid gap-2 p-3 rounded-2xl ${formData.custom_branding?.dark_mode_enabled ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'}`}
                style={{ gridTemplateColumns: `repeat(${[
                  formData.social_links?.phone,
                  formData.social_links?.whatsapp,
                  formData.social_links?.email,
                  true // Save button
                ].filter(Boolean).length}, minmax(0, 1fr))` }}
              >
                {formData.social_links?.phone && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-full bg-[#1D9E75]/20 flex items-center justify-center text-[#1D9E75]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                    </div>
                    <span className="text-xs font-medium">Call</span>
                  </div>
                )}
                {formData.social_links?.whatsapp && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                      <span className="font-bold text-xs">WA</span>
                    </div>
                    <span className="text-xs font-medium">WhatsApp</span>
                  </div>
                )}
                {formData.social_links?.email && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#534AB7]">
                      <span className="font-bold text-xs">@</span>
                    </div>
                    <span className="text-xs font-medium">Email</span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 w-10 rounded-full bg-[#D85A30]/20 flex items-center justify-center text-[#D85A30]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </div>
                  <span className="text-xs font-medium">Save</span>
                </div>
              </div>

              {formData.personal_info?.bio && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">ABOUT</h3>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    {formData.personal_info.bio}
                  </p>
                </div>
              )}

              {/* Social Links Section */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {formData.social_links?.linkedin && (
                  <div className="h-10 w-10 rounded-full bg-[#0077B5]/20 flex items-center justify-center text-[#0077B5]">
                    <span className="font-bold text-xs">In</span>
                  </div>
                )}
                {formData.social_links?.instagram && (
                  <div className="h-10 w-10 rounded-full bg-[#E1306C]/20 flex items-center justify-center text-[#E1306C]">
                    <span className="font-bold text-xs">Ig</span>
                  </div>
                )}
                {formData.social_links?.facebook && (
                  <div className="h-10 w-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
                    <span className="font-bold text-xs">Fb</span>
                  </div>
                )}
                {formData.social_links?.twitter && (
                  <div className="h-10 w-10 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center text-[#1DA1F2]">
                    <span className="font-bold text-xs">X</span>
                  </div>
                )}
                {formData.social_links?.youtube && (
                  <div className="h-10 w-10 rounded-full bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000]">
                    <span className="font-bold text-xs">Yt</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">SEND AN INQUIRY</h3>
                <div className={`p-4 rounded-2xl ${formData.custom_branding?.dark_mode_enabled ? 'bg-[#1A1A24]' : 'bg-[#F5F5F8]'}`}>
                  <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                  <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                  <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                  <div className="w-full h-8 bg-[#534AB7] rounded-lg"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
