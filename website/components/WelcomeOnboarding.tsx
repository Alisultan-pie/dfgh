import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Heart, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Info,
  Sparkles,
  Lock,
  Cloud,
  FileText,
  Camera,
  Archive,
  Star,
  PawPrint
} from 'lucide-react';

interface WelcomeOnboardingProps {
  onClose: () => void;
  onStartUpload: () => void;
}

export function WelcomeOnboarding({ onClose, onStartUpload }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Pet Pet Club",
      description: "Care made smart. Love made strong.",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-center mb-4">
              <h2 className="text-3xl text-cyan-500 font-medium mb-2">Pet Pet Club</h2>
              <PawPrint className="h-12 w-12 text-cyan-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simplifying Pet Care for Better Lives</h3>
            <p className="text-muted-foreground">
              Pet Pet Club helps you reduce pet care costs and enhance the bond with your furry family members. 
              We use smart technology to make pet care easier, more affordable, and more effective for 
              happier, healthier lives together.
            </p>
          </div>
          
          <div className="grid gap-3 mt-6">
            <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg">
              <PawPrint className="h-5 w-5 text-cyan-500" />
              <div>
                <div className="font-medium">Smart Care Technology</div>
                <div className="text-sm text-muted-foreground">Advanced digital tools to simplify and improve pet care</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Community Support</div>
                <div className="text-sm text-muted-foreground">Connect with fellow pet parents in Hong Kong for advice and support</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Secure & Reliable</div>
                <div className="text-sm text-muted-foreground">Your pet's information is protected with blockchain technology</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How Smart Care Works",
      description: "Simple steps to enhance your pet's life",
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Create Pet Profile</h4>
                <p className="text-sm text-muted-foreground">Upload photos and information to create a secure digital identity for your pet</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Smart Blockchain Protection</h4>
                <p className="text-sm text-muted-foreground">We automatically secure your pet's data using advanced blockchain technology</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Community Verification</h4>
                <p className="text-sm text-muted-foreground">Our trusted community helps verify and support your pet's health journey</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Access Anywhere</h4>
                <p className="text-sm text-muted-foreground">View your pet's secure records from any device, anytime you need them</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                5
              </div>
              <div>
                <h4 className="font-semibold">Strengthen Your Bond</h4>
                <p className="text-sm text-muted-foreground">Better care management leads to stronger relationships and healthier pets</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Smart Pet Care Features",
      description: "Everything you need for better pet care",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50">
              <div className="flex items-start gap-3">
                <Camera className="h-6 w-6 text-cyan-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Digital Pet ID & Photos</h4>
                  <p className="text-sm text-muted-foreground">Secure photo galleries and digital identification with blockchain protection</p>
                  <Badge variant="outline" className="mt-2 border-cyan-200 text-cyan-700">💙 Smart Technology</Badge>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Health & Care Records</h4>
                  <p className="text-sm text-muted-foreground">Track vaccinations, medical history, and care schedules to reduce costs</p>
                  <Badge variant="outline" className="mt-2 border-blue-200 text-blue-700">🏥 Cost Saving</Badge>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Pet Parent Community</h4>
                  <p className="text-sm text-muted-foreground">Connect with other pet parents in Hong Kong for support and advice</p>
                  <Badge variant="outline" className="mt-2 border-green-200 text-green-700">🏠 Hong Kong Community</Badge>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Lifetime Security</h4>
                  <p className="text-sm text-muted-foreground">Military-grade blockchain protection ensures your pet's data is safe forever</p>
                  <Badge variant="outline" className="mt-2 border-purple-200 text-purple-700">🛡️ Forever Safe</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start Your Journey!",
      description: "Join Hong Kong's smartest pet care community",
      content: (
        <div className="space-y-4">
          <Alert className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950">
            <Heart className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Your Pet Pet Club account is ready! 🎉</div>
                <div className="text-sm">
                  You now have access to Hong Kong's smartest pet care platform. 
                  Your pet's precious memories will be protected with advanced blockchain technology 
                  while you enjoy reduced care costs and a stronger bond with your beloved pets! 💙
                </div>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-semibold">What happens when you add your first pet:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-cyan-500" />
                <span>Create a secure digital profile with blockchain protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-cyan-500" />
                <span>Join our smart pet care community in Hong Kong</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-cyan-500" />
                <span>Start reducing pet care costs with smart management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-cyan-500" />
                <span>Access expert care resources and community support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-cyan-500" />
                <span>Strengthen your bond through better care tracking</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button onClick={onStartUpload} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
              <Sparkles className="mr-2 h-4 w-4" />
              Add My First Pet
            </Button>
            <Button variant="outline" onClick={onClose} className="border-cyan-300 text-cyan-700 hover:bg-cyan-50">
              <Star className="mr-2 h-4 w-4" />
              Explore Platform
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              🏠 Proudly serving pet families across Hong Kong with smart care solutions
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-cyan-200 bg-gradient-to-b from-cyan-50/50 to-blue-50/50 dark:border-cyan-800 dark:from-cyan-950/50 dark:to-blue-950/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentStepData.title}
                {currentStep === 0 && <PawPrint className="h-5 w-5 text-cyan-500" />}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
            <Badge variant="outline" className="border-cyan-300 text-cyan-700">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex items-center justify-between pt-4 border-t border-cyan-200">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-cyan-500' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={onClose}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Join Pet Pet Club
                  <Heart className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}