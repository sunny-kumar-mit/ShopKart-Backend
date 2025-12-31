import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Login() {
    const navigate = useNavigate();

    // Login State
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
    const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');

    // Separate states for inputs
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [password, setPassword] = useState('');

    // OTP State
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot Password State
    const [forgotStep, setForgotStep] = useState(0); // 0: Closed, 1: Email/Mobile, 2: OTP
    const [forgotIdentifier, setForgotIdentifier] = useState('');
    const [forgotOtpValues, setForgotOtpValues] = useState({ emailOtp: '', mobileOtp: '' });
    const [newPassword, setNewPassword] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Construct identifier based on method
        let identifier = '';
        if (loginMethod === 'email') {
            identifier = email;
        } else {
            identifier = `${countryCode}${mobile}`;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            toast.success('OTP sent!');
            setStep(2);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Reconstruct identifier for verification
        let identifier = '';
        if (loginMethod === 'email') {
            identifier = email;
        } else {
            identifier = `${countryCode}${mobile}`;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed');

            // Store token and user data
            const userData = { ...data.user, token: data.token };
            useAuthStore.getState().login(userData);

            toast.success(`Welcome back, ${data.user.name}! 👋`);
            navigate('/');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Forgot Password Handlers ---

    const handleForgotSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: forgotIdentifier }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
            toast.success('OTPs sent to your Email and Mobile');
            setForgotStep(2);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotVerifyReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotOtpValues.emailOtp || !forgotOtpValues.mobileOtp || !newPassword) {
            return toast.error('Please fill all fields');
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: forgotIdentifier,
                    emailOtp: forgotOtpValues.emailOtp,
                    mobileOtp: forgotOtpValues.mobileOtp,
                    newPassword
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to reset password');
            toast.success('Password reset successfully! You can now login.');
            setForgotStep(0); // Close modal
            setStep(1); // Go to login
            // Auto-fill logic could be complex with tabs, let's just clear or leave as is
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh] py-10">
                <Card className="w-full max-w-md relative z-10">
                    <CardHeader>
                        <CardTitle className="text-center">{step === 1 ? 'Welcome Back' : 'Verify Login'}</CardTitle>
                        <CardDescription className="text-center">
                            {step === 1
                                ? 'Enter your credentials to access your account'
                                : `Enter the code sent to your ${loginMethod}`}
                        </CardDescription>
                    </CardHeader>

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <CardContent className="space-y-4">
                                <Tabs defaultValue="email" value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'mobile')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="email">Email</TabsTrigger>
                                        <TabsTrigger value="mobile">Mobile Number</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="email" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required={loginMethod === 'email'}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="mobile" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile Number</Label>
                                            <div className="flex gap-2">
                                                <Select value={countryCode} onValueChange={setCountryCode}>
                                                    <SelectTrigger className="w-[80px]">
                                                        <SelectValue placeholder="+91" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="+91">+91 (IN)</SelectItem>
                                                        <SelectItem value="+1">+1 (US)</SelectItem>
                                                        <SelectItem value="+44">+44 (UK)</SelectItem>
                                                        <SelectItem value="+81">+81 (JP)</SelectItem>
                                                        <SelectItem value="+86">+86 (CN)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    id="mobile"
                                                    type="tel"
                                                    placeholder="1234567890"
                                                    value={mobile}
                                                    onChange={(e) => setMobile(e.target.value)}
                                                    required={loginMethod === 'mobile'}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Button
                                            variant="link"
                                            className="px-0 font-normal h-auto text-xs text-primary"
                                            onClick={() => setForgotStep(1)}
                                            type="button"
                                        >
                                            Forgot password?
                                        </Button>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                                >
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </Button>
                                <div className="text-sm text-center text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-primary hover:underline">
                                        Sign up
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={6}
                                        className="text-center text-2xl tracking-widest"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify Login'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep(1)}
                                >
                                    Back to Login
                                </Button>
                            </CardFooter>
                        </form>
                    )}
                </Card>

                {/* Forgot Password Modal Overlay */}
                {forgotStep > 0 && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <Card className="w-full max-w-md shadow-2xl scale-100">
                            <CardHeader>
                                <CardTitle>Reset Password</CardTitle>
                                <CardDescription>
                                    {forgotStep === 1
                                        ? "Enter your email or mobile to receive OTPs."
                                        : "Enter the OTPs sent to your devices and set a new password."}
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={forgotStep === 1 ? handleForgotSendOtp : handleForgotVerifyReset}>
                                <CardContent className="space-y-4">
                                    {forgotStep === 1 ? (
                                        <div className="space-y-2">
                                            <Label>Email or Mobile Number</Label>
                                            <Input
                                                placeholder="Enter registered email or mobile"
                                                value={forgotIdentifier}
                                                onChange={(e) => setForgotIdentifier(e.target.value)}
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Email OTP</Label>
                                                    <Input
                                                        placeholder="123456"
                                                        value={forgotOtpValues.emailOtp}
                                                        onChange={(e) => setForgotOtpValues({ ...forgotOtpValues, emailOtp: e.target.value })}
                                                        required
                                                        className="text-center tracking-widest font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Mobile OTP</Label>
                                                    <Input
                                                        placeholder="123456"
                                                        value={forgotOtpValues.mobileOtp}
                                                        onChange={(e) => setForgotOtpValues({ ...forgotOtpValues, mobileOtp: e.target.value })}
                                                        required
                                                        className="text-center tracking-widest font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>New Password</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2">
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <span className="animate-pulse">Processing...</span> : (forgotStep === 1 ? 'Send OTPs' : 'Reset Password')}
                                    </Button>
                                    <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotStep(0)}>
                                        Cancel
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
}
