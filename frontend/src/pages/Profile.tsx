import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
    User, Mail, Phone, Calendar, Shield, Lock, LogOut,
    Trash2, Bell, Globe, CreditCard, ChevronRight, AlertTriangle,
    Camera, CheckCircle2, MapPin, Package, Heart, Sparkles,
    ShoppingBag, HelpCircle, ArrowLeft
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Link, useNavigate } from 'react-router-dom';

// ... (interfaces)

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    mobile?: string;
    dob?: string;
    gender?: string;
    isVerified?: boolean;
    preferences: {
        language: string;
        notifications: {
            orders: boolean;
            offers: boolean;
            promotions: boolean;
        }
    };
    role?: string;
}


export default function Profile() {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activeSection, setActiveSection] = useState('personal');
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpValues, setOtpValues] = useState({ emailOtp: '', mobileOtp: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await UserService.getProfile();
            if (!data.preferences) {
                data.preferences = {
                    language: 'en',
                    notifications: { orders: true, offers: true, promotions: true }
                };
            }
            if (data.dob) {
                data.dob = new Date(data.dob).toISOString().split('T')[0];
            }
            setProfile(data);
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        try {
            await UserService.updateProfile(profile);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleInitiateChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            return toast.error('New passwords do not match');
        }
        if (!passwordData.current || !passwordData.new) {
            return toast.error('Please fill all fields');
        }

        setSaving(true);
        try {
            // STEP 1: Verify Current Password & Send OTPs
            await UserService.initiateChangePassword(passwordData.current);
            toast.success('OTPs sent to your registered Email and Mobile.');
            setShowOtpModal(true); // Open OTP Modal
        } catch (error: any) {
            toast.error(error.message || 'Failed to initiate password change');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValues.emailOtp || !otpValues.mobileOtp) {
            return toast.error('Please enter both OTPs');
        }
        setSaving(true);
        try {
            // STEP 2: Verify OTPs & Update Password
            await UserService.verifyChangePasswordOTP({
                emailOtp: otpValues.emailOtp,
                mobileOtp: otpValues.mobileOtp,
                newPassword: passwordData.new
            });
            toast.success('Password changed successfully!');
            setShowOtpModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
            setOtpValues({ emailOtp: '', mobileOtp: '' });
        } catch (error: any) {
            toast.error(error.message || 'Invalid OTPs or Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await UserService.deleteAccount();
            logout();
            window.location.href = '/login';
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
            </div>
        );
    }

    if (!profile) return null;

    const sections = [
        { id: 'personal', label: 'Personal Information', icon: User, desc: 'Manage your personal details' },
        { id: 'security', label: 'Login & Security', icon: Shield, desc: 'Password & 2FA settings' },
        { id: 'preferences', label: 'Preferences', icon: Globe, desc: 'Notification & Language' },
    ];

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-20">
            {/* Hero / Header Section */}
            <div className="relative h-64 bg-gradient-hero overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute -bottom-10 left-0 w-full h-20 bg-gradient-to-t from-zinc-50/50 dark:from-zinc-950 to-transparent" />
            </div>

            <div className="container mx-auto px-4 -mt-32 relative z-10 max-w-6xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        className="gap-2 text-white hover:text-white hover:bg-white/10 pl-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-8 items-start"
                >
                    {/* Left Sidebar / Profile Card */}
                    <div className="w-full md:w-80 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 backdrop-blur-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4 group">
                                    <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-zinc-800 shadow-2xl ring-4 ring-blue-50 dark:ring-blue-900/30">
                                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl text-white font-bold overflow-hidden relative">
                                            {profile.avatar ? (
                                                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                profile.name.charAt(0)
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-zinc-900" title="Online" />
                                </div>

                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1 flex items-center gap-2">
                                    {profile.name}
                                    {profile.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50 dark:fill-blue-900/50" />}
                                </h1>
                                <p className="text-muted-foreground text-sm font-medium mb-4">{profile.email}</p>

                                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group cursor-pointer hover:bg-blue-100 transition-colors">
                                        <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-blue-800 dark:text-blue-200">Orders</span>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group cursor-pointer hover:bg-amber-100 transition-colors">
                                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-amber-800 dark:text-amber-200">Plus</span>
                                    </div>
                                </div>

                                <div className="w-full space-y-1">
                                    {sections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group text-left relative overflow-hidden ${activeSection === section.id
                                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-white/20' : 'bg-transparent'}`}>
                                                <section.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{section.label}</p>
                                                {/* <p className="text-[10px] opacity-80">{section.desc}</p> */}
                                            </div>
                                            {activeSection === section.id && (
                                                <motion.div layoutId="activeTab" className="absolute right-4">
                                                    <ChevronRight className="w-4 h-4" />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}

                                    <div className="my-4 border-t border-dashed border-zinc-200 dark:border-zinc-800" />

                                    <Link to="/help" className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-muted-foreground hover:text-foreground mb-1">
                                        <div className="p-2 rounded-lg bg-transparent group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800">
                                            <HelpCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">Help Center</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>

                                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-3 p-4 h-auto rounded-xl" onClick={handleLogout}>
                                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                            <LogOut className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">Logout</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone Mini Card */}
                        <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6">
                            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Danger Zone
                            </h3>
                            <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-4">
                                Deleting your account is permanent and cannot be undone.
                            </p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-none rounded-xl">
                                        Delete Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-red-600 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" /> Delete Account?
                                        </DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline">Cancel</Button>
                                        <Button variant="destructive" onClick={handleDeleteAccount}>Confirm Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 min-h-[600px] relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSection}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="space-y-8"
                                >
                                    {/* PERSONAL INFORMATION */}
                                    {activeSection === 'personal' && (
                                        <>
                                            <div className="flex items-center justify-between border-b pb-6 border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Personal Information</h2>
                                                    <p className="text-muted-foreground mt-1">Update your photo and personal details here.</p>
                                                </div>
                                                <Button onClick={handleProfileUpdate} disabled={saving} className="rounded-xl shadow-lg shadow-blue-200 dark:shadow-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:to-indigo-700 border-0">
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                    {saving ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                <div className="space-y-2.5">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Full Name</Label>
                                                    <Input
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Date of Birth</Label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="date"
                                                            className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                                            value={profile.dob}
                                                            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Gender</Label>
                                                    <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 w-fit">
                                                        {['Male', 'Female', 'Other'].map(g => (
                                                            <button
                                                                key={g}
                                                                type="button"
                                                                onClick={() => setProfile({ ...profile, gender: g })}
                                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${profile.gender === g
                                                                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400'
                                                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                                                    }`}
                                                            >
                                                                {g}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Mobile Number</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                                            value={profile.mobile}
                                                            onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                                                            placeholder="Add mobile number"
                                                        />
                                                        {profile.mobile && <div className="absolute right-3 top-3.5"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 flex items-start gap-4">
                                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">Email Address</h4>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.email}</p>
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                    Primary
                                                </span>
                                            </div>

                                            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 flex items-start gap-4">
                                                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">Saved Addresses</h4>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your saved addresses for faster checkout.</p>
                                                </div>
                                                <Button size="sm" variant="outline" asChild className="rounded-lg h-9">
                                                    <Link to="/addresses">Manage</Link>
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {/* SECURITY */}
                                    {activeSection === 'security' && (
                                        <>
                                            <div className="flex items-center justify-between border-b pb-6 border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Login & Security</h2>
                                                    <p className="text-muted-foreground mt-1">Maintain security of your account.</p>
                                                </div>
                                            </div>

                                            <div className="max-w-md space-y-6">
                                                <form onSubmit={handleInitiateChangePassword} className="space-y-5">
                                                    <div className="space-y-2.5">
                                                        <Label>Current Password</Label>
                                                        <Input type="password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} className="h-11 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Label>New Password</Label>
                                                        <Input type="password" value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} className="h-11 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Label>Confirm New Password</Label>
                                                        <Input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} className="h-11 rounded-xl" />
                                                    </div>
                                                    <Button type="submit" disabled={saving} className="w-full rounded-xl h-11 bg-zinc-900 text-white hover:bg-zinc-800">
                                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                                                    </Button>
                                                </form>

                                                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm text-green-600">
                                                                <Shield className="w-5 h-5" />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <div className="font-semibold text-sm">Two-Factor Authentication</div>
                                                                <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                                                            </div>
                                                        </div>
                                                        <Switch disabled checked={false} />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* PREFERENCES */}
                                    {activeSection === 'preferences' && (
                                        <>
                                            <div className="flex items-center justify-between border-b pb-6 border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Preferences</h2>
                                                    <p className="text-muted-foreground mt-1">Manage notifications and app settings.</p>
                                                </div>
                                                <Button onClick={handleProfileUpdate} disabled={saving} className="rounded-xl shadow-lg shadow-blue-200 dark:shadow-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:to-indigo-700 border-0">
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                    {saving ? 'Saving...' : 'Save Preferences'}
                                                </Button>
                                            </div>

                                            <div className="space-y-5">
                                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Email Notifications</h3>

                                                <div className="grid gap-4">
                                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                                                                <ShoppingBag className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold">Order Updates</div>
                                                                <div className="text-sm text-muted-foreground">Receive updates about your order status</div>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={profile.preferences.notifications.orders}
                                                            onCheckedChange={(checked) => setProfile({
                                                                ...profile,
                                                                preferences: { ...profile.preferences, notifications: { ...profile.preferences.notifications, orders: checked } }
                                                            })}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
                                                                <TicketPercent className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold">Promotions & Offers</div>
                                                                <div className="text-sm text-muted-foreground">Receive emails about new products and best deals</div>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={profile.preferences.notifications.promotions}
                                                            onCheckedChange={(checked) => setProfile({
                                                                ...profile,
                                                                preferences: { ...profile.preferences, notifications: { ...profile.preferences.notifications, promotions: checked } }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* OTP VERIFICATION MODAL */}
            <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold mb-2">Security Verification</DialogTitle>
                        <DialogDescription className="text-center">
                            To secure your account, please enter the OTPs sent to your <span className="font-medium text-foreground">Email</span> and <span className="font-medium text-foreground">Mobile</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email OTP</Label>
                            <Input
                                placeholder="Enter code sent to email"
                                value={otpValues.emailOtp}
                                onChange={(e) => setOtpValues({ ...otpValues, emailOtp: e.target.value })}
                                className="text-center tracking-widest text-lg font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile OTP</Label>
                            <Input
                                placeholder="Enter code sent to mobile"
                                value={otpValues.mobileOtp}
                                onChange={(e) => setOtpValues({ ...otpValues, mobileOtp: e.target.value })}
                                className="text-center tracking-widest text-lg font-mono"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <Button onClick={handleVerifyOtp} disabled={saving} className="w-full h-11 text-lg">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Update Password'}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowOtpModal(false)} className="w-full">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M21 12a9 9 0 1 1-6.219-8.56" /> </svg>
    )
}
function TicketPercent({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="m9 15 6-6" /><path d="M9 9h.01" /><path d="M15 15h.01" /></svg>
    )
}
