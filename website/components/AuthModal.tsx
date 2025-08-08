import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Heart, Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Info, Play, Shield, FileText, Users } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export function AuthModal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const { signIn, signUp } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await signIn(loginEmail, loginPassword);
      toast.success('Welcome to Pet Pet Club! 🎉');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      console.error('Login error:', err);
      
      // Show specific guidance based on error type
      if (errorMessage.includes('Invalid email or password')) {
        toast.error('Login failed', {
          description: 'Please check your email and password, or join our community with a new account.'
        });
      } else {
        toast.error('Sign in failed', {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!signupEmail.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(signupEmail, signupPassword, signupName);
      
      // If we get here, signup was successful
      setSuccess('Welcome to Pet Pet Club! Your account has been created successfully! 🎉');
      toast.success('Account created!', {
        description: 'Welcome to our smart pet care community! You can now sign in.'
      });
      
      // Switch to login tab after successful signup
      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(signupEmail);
        setLoginPassword(signupPassword);
        setSuccess(''); // Clear the success message when switching
      }, 2000);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create account';
      console.error('Signup error:', err);
      
      setError(errorMessage);
      
      if (errorMessage.includes('already exists')) {
        toast.error('Account exists', {
          description: 'Looks like you\'re already part of our community! Try signing in instead.'
        });
        // Auto-fill login form and switch to login tab
        setTimeout(() => {
          setActiveTab('login');
          setLoginEmail(signupEmail);
          setError(''); // Clear error when switching
        }, 1000);
      } else {
        toast.error('Sign up failed', {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    const demoEmail = 'demo@petpetclub.com';
    const demoPassword = 'demo123456';
    const demoName = 'Pet Lover Demo';

    try {
      // First try to sign in with demo credentials
      try {
        await signIn(demoEmail, demoPassword);
        toast.success('Welcome to the Pet Pet Club demo! 🐾');
        return;
      } catch (signInError) {
        // If sign in fails, create the demo account first
        console.log('Demo account not found, creating...');
      }

      // Create demo account
      try {
        await signUp(demoEmail, demoPassword, demoName);
        toast.success('Demo account created for Pet Pet Club!');
        
        // Then try to sign in
        setTimeout(async () => {
          try {
            await signIn(demoEmail, demoPassword);
            toast.success('Welcome to our smart pet care community! 🎉');
          } catch (err) {
            console.error('Demo sign in failed:', err);
            // Fill in the form so user can try manually
            setLoginEmail(demoEmail);
            setLoginPassword(demoPassword);
            setActiveTab('login');
            toast.info('Demo credentials filled in - click "Join Pet Pet Club" to continue');
          }
        }, 1000);
      } catch (signupError: any) {
        // If signup fails (maybe user exists), try to sign in anyway
        setLoginEmail(demoEmail);
        setLoginPassword(demoPassword);
        setActiveTab('login');
        toast.info('Demo credentials filled in - click "Join Pet Pet Club" to continue');
      }
    } catch (err: any) {
      console.error('Demo setup error:', err);
      
      // If everything fails, still try to fill in the form
      setLoginEmail(demoEmail);
      setLoginPassword(demoPassword);
      setActiveTab('login');
      
      toast.info('Demo credentials filled in', {
        description: 'Click "Join Pet Pet Club" to continue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid gap-8 lg:grid-cols-2">
        {/* Project Information Panel */}
        <div className="space-y-6">
          <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 dark:border-cyan-800 dark:from-cyan-950 dark:to-blue-950">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <CardTitle className="text-3xl text-cyan-500">Pet Pet Club</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Care made smart. Love made strong.
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">💙 Smart Care</Badge>
                <Badge variant="outline" className="border-cyan-200 text-cyan-700">🛡️ Secure & Safe</Badge>
                <Badge variant="outline" className="border-cyan-200 text-cyan-700">🌟 Trusted Platform</Badge>
                <Badge variant="outline" className="border-cyan-200 text-cyan-700">🏠 Hong Kong Based</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Simplifying Pet Care for Happier, Healthier Lives</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Heart className="h-5 w-5 text-cyan-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Smart Digital Pet ID</div>
                      <div className="text-sm text-muted-foreground">
                        Create secure digital profiles for your pets with advanced blockchain technology
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Pet Care Community</div>
                      <div className="text-sm text-muted-foreground">
                        Connect with fellow pet parents and access expert care resources in Hong Kong
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Lifetime Protection</div>
                      <div className="text-sm text-muted-foreground">
                        Your pet's information is secured with military-grade encryption and blockchain technology
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Heart className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Enhanced Bond</div>
                      <div className="text-sm text-muted-foreground">
                        Strengthen your relationship with your pets through better care management and tracking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">What Pet Parents Love</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span>Secure pet photo galleries and medical record storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span>Smart vaccination and health tracking systems</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span>Community verification and trust network</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span>Reduced care costs through smart management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span>Access your pet's information from anywhere, anytime</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Serving pet families across Hong Kong
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://petpetclub.com.hk/" target="_blank" rel="noopener noreferrer">
                      <Heart className="h-4 w-4 mr-2" />
                      Visit Our Website
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>100% Safe & Smart:</strong> Pet Pet Club uses advanced blockchain technology 
              and military-grade security to protect your pet's precious memories. 
              We're committed to making pet care smarter, more affordable, and strengthening the bond 
              between you and your beloved pets. 🐾💙
            </AlertDescription>
          </Alert>
        </div>

        {/* Authentication Panel */}
        <Card className="h-fit">
          <CardHeader className="text-center">
            <CardTitle>Join Pet Pet Club</CardTitle>
            <CardDescription>
              Sign in to start your smart pet care journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo Button */}
            <div className="mb-4">
              <Button
                onClick={handleDemoLogin}
                disabled={isLoading}
                variant="secondary"
                className="w-full bg-cyan-100 hover:bg-cyan-200 text-cyan-800"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Try Demo Account (Explore Smart Care)
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Experience our smart pet care platform with sample data
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or create your own account</span>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); clearMessages(); }} className="space-y-4 mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Welcome Back</TabsTrigger>
                <TabsTrigger value="signup">Join Our Club</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-600">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Welcome Back to Pet Pet Club
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupName">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupName"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        disabled={isLoading}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="Choose a secure password (min 6 characters)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        minLength={6}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Join Pet Pet Club
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <strong>What you'll get:</strong> A smart pet care account to create secure digital profiles 
                  for your pets, access expert care resources, and connect with the Pet Pet Club community in Hong Kong. 
                  Reduce costs and enhance your bond for happier, healthier lives with your beloved pets. 🐾💙
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}