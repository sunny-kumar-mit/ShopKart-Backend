import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [countryCode, setCountryCode] = useState('+91');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: ''
    });
    const [otps, setOtps] = useState({ email: '', mobile: '' });
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    mobile: `${countryCode}${formData.mobile}`
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send OTP');

            toast.success('OTPs sent to Email and Mobile!');
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

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: formData.email,
                    emailOtp: otps.email,
                    mobileOtp: otps.mobile
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed');

            // Store token and user data
            const userData = { ...data.user, token: data.token };
            useAuthStore.getState().login(userData);

            toast.success(`Welcome, ${data.user.name}! 🎉`);
            navigate('/');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh] py-10">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>{step === 1 ? 'Create an Account' : 'Verify Account'}</CardTitle>
                        <CardDescription>
                            {step === 1
                                ? 'Enter your details to get started'
                                : `Enter the codes sent to your Email and Mobile`}
                        </CardDescription>
                    </CardHeader>

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
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
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            required
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Sending OTPs...' : 'Next'}
                                </Button>
                                <div className="text-sm text-center text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-primary hover:underline">
                                        Sign in
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emailOtp">Email Verification Code</Label>
                                    <Input
                                        id="emailOtp"
                                        type="text"
                                        placeholder="123456"
                                        value={otps.email}
                                        onChange={(e) => setOtps({ ...otps, email: e.target.value })}
                                        required
                                        maxLength={6}
                                        className="text-center text-xl tracking-widest"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobileOtp">Mobile Verification Code</Label>
                                    <Input
                                        id="mobileOtp"
                                        type="text"
                                        placeholder="654321"
                                        value={otps.mobile}
                                        onChange={(e) => setOtps({ ...otps, mobile: e.target.value })}
                                        required
                                        maxLength={6}
                                        className="text-center text-xl tracking-widest"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify Codes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep(1)}
                                >
                                    Back to Details
                                </Button>
                            </CardFooter>
                        </form>
                    )}
                </Card>
            </div>
        </Layout>
    );
}
