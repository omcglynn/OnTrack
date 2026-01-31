import { SemesterPlan } from './roadmap-view';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2, TrendingUp, Briefcase, Zap } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  semesters: SemesterPlan[];
  highlights: string[];
  bestFor: string;
}

interface PlanComparisonProps {
  plans: Plan[];
  onSelectPlan: (planId: string) => void;
}

export function PlanComparison({ plans, onSelectPlan }: PlanComparisonProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Path</h2>
        <p className="text-gray-600">We've generated 3 personalized plans based on your goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const totalCredits = plan.semesters.reduce((sum, sem) => sum + sem.totalCredits, 0);
          const avgCredits = totalCredits / plan.semesters.length;
          const internshipSemesters = plan.semesters.filter(s => s.isInternshipSemester).length;
          
          return (
            <Card
              key={plan.id}
              className="p-6 bg-white hover:shadow-xl transition-all border-2 hover:border-blue-500"
            >
              {/* Plan Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.id === 'balanced' && (
                    <Badge className="bg-blue-500">Recommended</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Credits</span>
                  <span className="font-semibold">{totalCredits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Credits/Semester</span>
                  <span className="font-semibold">{avgCredits.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Internship Periods</span>
                  <span className="font-semibold">{internshipSemesters}</span>
                </div>
              </div>

              {/* Best For */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold">Best For:</span>
                </div>
                <p className="text-sm text-gray-700">{plan.bestFor}</p>
              </div>

              {/* Highlights */}
              <div className="space-y-2 mb-6">
                {plan.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                onClick={() => onSelectPlan(plan.id)}
                className="w-full"
                variant={plan.id === 'balanced' ? 'default' : 'outline'}
              >
                Select This Plan
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card className="p-6 bg-white mt-8">
        <h3 className="font-bold text-lg mb-4">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 pr-4">Feature</th>
                {plans.map(plan => (
                  <th key={plan.id} className="text-center py-3 px-4">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 pr-4 font-medium">Workload per semester</td>
                {plans.map(plan => {
                  const avg = plan.semesters.reduce((sum, s) => sum + s.totalCredits, 0) / plan.semesters.length;
                  return (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {avg <= 13 ? '🟢 Light' : avg <= 16 ? '🟡 Moderate' : '🔴 Heavy'}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Internship opportunities</td>
                {plans.map(plan => {
                  const count = plan.semesters.filter(s => s.isInternshipSemester).length;
                  return (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {count} semester{count !== 1 ? 's' : ''}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Specialization focus</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.id === 'fast-track' ? 'Early' : plan.id === 'internship-heavy' ? 'Balanced' : 'Gradual'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Flexibility for changes</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.id === 'balanced' ? 'High' : plan.id === 'fast-track' ? 'Low' : 'Medium'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Help Text */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-indigo-900 mb-2">Not sure which to choose?</p>
            <p className="text-sm text-indigo-800">
              <strong>Balanced Plan</strong> is recommended for most students. It gives you time to explore different areas while maintaining steady progress. You can always adjust your plan later based on your experiences and evolving interests.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
