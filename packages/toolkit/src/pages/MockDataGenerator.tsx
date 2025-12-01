import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { JsonDisplayEditor } from '../components/JsonDisplayEditor';
import { 
  analyzeJsonStructure, 
  generateMockData, 
  exportToJson, 
  exportToCsv,
  COMMON_TEMPLATES,
  type MockDataOptions,
  type FieldMapping 
} from '../lib/mock-data';

type Step = 1 | 2 | 3;

export const MockDataGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Step 1: JSON Structure Input
  const [inputJson, setInputJson] = useState<string>('{}');
  const [parsedInput, setParsedInput] = useState<any>(null);
  
  // Step 2: Field Mappings and Options
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [options, setOptions] = useState<MockDataOptions>({
    count: 5,
    seed: undefined,
  });
  
  // Step 3: Generated Data
  const [outputData, setOutputData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const isValidJson = useMemo(() => {
    try {
      const parsed = JSON.parse(inputJson);
      return parsed && typeof parsed === 'object';
    } catch {
      return false;
    }
  }, [inputJson]);

  const handleJsonChange = useCallback((value: string) => {
    setInputJson(value);
    // Reset subsequent steps when JSON changes
    if (currentStep > 1) {
      setParsedInput(null);
      setFieldMappings([]);
      setOutputData([]);
    }
  }, [currentStep]);

  // Step 1: Analyze JSON Structure
  const handleAnalyzeStructure = useCallback(() => {
    if (!isValidJson) {
      toast.error('Please provide valid JSON input');
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const mappings = analyzeJsonStructure(parsed);
      
      setParsedInput(parsed);
      setFieldMappings(mappings);
      
      // Clear subsequent steps data
      setOutputData([]);
      
      // Move to step 2
      setCurrentStep(2);
      toast.success(`Analyzed structure, detected ${mappings.length} fields`);
    } catch (error) {
      toast.error('Failed to parse JSON');
    }
  }, [inputJson, isValidJson]);

  // Step 2: Generate Mock Data
  const handleGenerateData = useCallback(async () => {
    if (!parsedInput || fieldMappings.length === 0) {
      toast.error('Please analyze JSON structure first');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const generated = generateMockData(parsedInput, options, fieldMappings);
      setOutputData(generated);
      
      // Move to step 3
      setCurrentStep(3);
      toast.success(`Generated ${generated.length} mock data records`);
    } catch (error) {
      toast.error('Failed to generate mock data');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [parsedInput, options, fieldMappings]);

  // Reset to specific step and clear subsequent data
  const resetToStep = useCallback((step: Step) => {
    setCurrentStep(step);
    
    if (step <= 1) {
      setParsedInput(null);
      setFieldMappings([]);
      setOutputData([]);
    } else if (step <= 2) {
      setOutputData([]);
    }
  }, []);

  const handleCopyToClipboard = useCallback(() => {
    const jsonStr = exportToJson(outputData, 'array');
    navigator.clipboard.writeText(jsonStr);
    toast.success('Copied to clipboard');
  }, [outputData]);

  const handleDownloadJson = useCallback(() => {
    const jsonStr = exportToJson(outputData, 'array');
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded');
  }, [outputData]);

  const handleDownloadCsv = useCallback(() => {
    const csvStr = exportToCsv(outputData);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV file downloaded');
  }, [outputData]);

  const handleLoadTemplate = useCallback((templateName: keyof typeof COMMON_TEMPLATES) => {
    const template = COMMON_TEMPLATES[templateName];
    setInputJson(JSON.stringify(template, null, 2));
    resetToStep(1);
  }, [resetToStep]);

  const updateFieldMapping = useCallback((index: number, newMethod: string) => {
    setFieldMappings(prev => 
      prev.map((mapping, i) => 
        i === index ? { ...mapping, fakerMethod: newMethod, detected: false } : mapping
      )
    );
  }, []);

  const StepHeader: React.FC<{ 
    step: Step; 
    title: string; 
    isActive: boolean; 
    isCompleted: boolean; 
    onClick: () => void 
  }> = ({ step, title, isActive, isCompleted, onClick }) => (
    <div 
      className={`flex items-center gap-3 p-4 border-l-4 cursor-pointer transition-colors ${
        isActive 
          ? 'border-primary bg-primary/5' 
          : isCompleted 
            ? 'border-green-500 bg-green-50 hover:bg-green-100' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : isCompleted 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-300 text-gray-700'
      }`}>
        {step}
      </div>
      <h3 className={`text-lg font-medium ${
        isActive ? 'text-foreground' : isCompleted ? 'text-green-700' : 'text-muted-foreground'
      }`}>
        {title}
      </h3>
      {isActive ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 max-w-6xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Mock Data Generator</h1>
          <p className="text-muted-foreground">
            Generate realistic mock data from JSON structure using intelligent field detection
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-1">
          <StepHeader 
            step={1}
            title="Input JSON Structure"
            isActive={currentStep === 1}
            isCompleted={currentStep > 1}
            onClick={() => resetToStep(1)}
          />
          
          {currentStep === 1 && (
            <div className="ml-11 p-4 space-y-4">
              {/* Templates */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Templates</h4>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(COMMON_TEMPLATES).map(template => (
                    <Button
                      key={template}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadTemplate(template as keyof typeof COMMON_TEMPLATES)}
                    >
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">JSON Structure</label>
                <div className="border rounded-md">
                  <JsonDisplayEditor
                    value={inputJson}
                    onChange={handleJsonChange}
                    placeholder="Enter your JSON structure..."
                    showModeToggle={true}
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyzeStructure}
                disabled={!isValidJson}
                className="w-full"
              >
                Analyze Structure & Continue
              </Button>
            </div>
          )}

          <StepHeader 
            step={2}
            title="Configure Field Mappings & Generation Options"
            isActive={currentStep === 2}
            isCompleted={currentStep > 2}
            onClick={() => resetToStep(2)}
          />

          {currentStep === 2 && (
            <div className="ml-11 p-4 space-y-6">
              {/* Field Mappings */}
              {fieldMappings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Field Mapping Configuration</h4>
                  <div className="border rounded-lg max-h-64 overflow-auto">
                    <div className="space-y-1 p-3">
                      {fieldMappings.map((mapping, index) => (
                        <div key={mapping.field} className="flex items-center gap-3 text-sm py-2">
                          <span className="font-mono text-muted-foreground min-w-0 flex-1 truncate">
                            {mapping.field}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <select
                            value={mapping.fakerMethod}
                            onChange={(e) => updateFieldMapping(index, e.target.value)}
                            className="text-sm border rounded px-2 py-1 min-w-[120px]"
                          >
                            <option value="email">Email</option>
                            <option value="firstName">First Name</option>
                            <option value="lastName">Last Name</option>
                            <option value="fullName">Full Name</option>
                            <option value="phone">Phone</option>
                            <option value="address">Address</option>
                            <option value="city">City</option>
                            <option value="company">Company</option>
                            <option value="jobTitle">Job Title</option>
                            <option value="id">ID Number</option>
                            <option value="uuid">UUID</option>
                            <option value="age">Age</option>
                            <option value="price">Price</option>
                            <option value="description">Description</option>
                            <option value="isActive">Boolean</option>
                          </select>
                          {mapping.detected && (
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-green-600 text-sm">✓</span>
                              </TooltipTrigger>
                              <TooltipContent>Auto-detected</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Generation Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Generation Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Count</label>
                    <Input
                      type="number"
                      min="1"
                      max="10000"
                      value={options.count}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        count: Math.max(1, parseInt(e.target.value) || 1) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Seed (optional)</label>
                    <Input
                      type="number"
                      placeholder="Random"
                      value={options.seed || ''}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        seed: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateData}
                disabled={fieldMappings.length === 0 || isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Mock Data'}
              </Button>
            </div>
          )}

          <StepHeader 
            step={3}
            title="View & Export Data"
            isActive={currentStep === 3}
            isCompleted={false}
            onClick={() => {}}
          />

          {currentStep === 3 && (
            <div className="ml-11 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Generated Data</h4>
                {outputData.length > 0 && (
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" onClick={handleCopyToClipboard}>
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy JSON to clipboard</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" onClick={handleDownloadJson}>
                          Download JSON
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download as JSON file</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" onClick={handleDownloadCsv}>
                          Download CSV
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download as CSV file</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>

              <div className="border rounded-lg h-96 overflow-auto">
                {outputData.length > 0 ? (
                  <pre className="p-4 text-xs font-mono">
                    {JSON.stringify(outputData, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Generated data will appear here
                  </div>
                )}
              </div>

              {outputData.length > 0 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => resetToStep(2)}
                  >
                    Reconfigure & Generate Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
