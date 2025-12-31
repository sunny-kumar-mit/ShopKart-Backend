import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Authentication failed');
            navigate('/login');
            return;
        }

        if (token && userId) {
            login({
                id: userId,
                name: name || '',
                email: email || '',
                token
            });
            toast.success(`Welcome back${name ? ', ' + name : ''}! 👋`);
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-lg">Authenticating...</div>
        </div>
    );
}
