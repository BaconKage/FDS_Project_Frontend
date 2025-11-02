import { useState } from "react";
import { Activity } from "lucide-react";

type FormState = {
  Age: string;
  Gender: string;
  Height: string;
  Weight: string;
  SystolicBP: string;
  DiastolicBP: string;
  HeartRate: string;
  SleepDuration: string;
};

type PredictResp = { prediction: string; bmi?: number; error?: string };

const toNum = (v: string) => (v === "" || v == null ? 0 : Number(v));

export default function PredictHealth() {
  const [formData, setFormData] = useState<FormState>({
    Age: "",
    Gender: "",
    Height: "",
    Weight: "",
    SystolicBP: "",
    DiastolicBP: "",
    HeartRate: "",
    SleepDuration: "",
  });

  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);

    // Build payload with numeric fields
    const payload = {
      Age: toNum(formData.Age),
      Gender: formData.Gender,
      Height: toNum(formData.Height),
      Weight: toNum(formData.Weight),
      SystolicBP: toNum(formData.SystolicBP),
      DiastolicBP: toNum(formData.DiastolicBP),
      HeartRate: toNum(formData.HeartRate),
      SleepDuration: toNum(formData.SleepDuration),
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        // If you set a Vite proxy, change to '/predict'
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: PredictResp = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");

      // show prediction
      setPrediction(data.prediction);

      // ✅ save for Dashboard (/compare)
      localStorage.setItem("lastSubmission", JSON.stringify(payload));
      console.log(
        "Saved lastSubmission:",
        JSON.parse(localStorage.getItem("lastSubmission") || "{}")
      );
    } catch (error) {
      setPrediction("Error connecting to backend");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Predict Health Status
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age */}
              <div>
                <label htmlFor="Age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="Age"
                  name="Age"
                  value={formData.Age}
                  onChange={handleChange}
                  min="0" max="120" placeholder="e.g., 25"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="Gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="Gender"
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="Height" className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="Height"
                    name="Height"
                    value={formData.Height}
                    onChange={handleChange}
                    min="0" max="250" placeholder="e.g., 170"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="Weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="Weight"
                    name="Weight"
                    value={formData.Weight}
                    onChange={handleChange}
                    min="0" max="300" placeholder="e.g., 65"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="SystolicBP" className="block text-sm font-medium text-gray-700 mb-2">
                    Systolic BP
                  </label>
                  <input
                    type="number"
                    id="SystolicBP"
                    name="SystolicBP"
                    value={formData.SystolicBP}
                    onChange={handleChange}
                    min="0" max="250" placeholder="e.g., 120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="DiastolicBP" className="block text-sm font-medium text-gray-700 mb-2">
                    Diastolic BP
                  </label>
                  <input
                    type="number"
                    id="DiastolicBP"
                    name="DiastolicBP"
                    value={formData.DiastolicBP}
                    onChange={handleChange}
                    min="0" max="150" placeholder="e.g., 80"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Heart Rate & Sleep */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="HeartRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    id="HeartRate"
                    name="HeartRate"
                    value={formData.HeartRate}
                    onChange={handleChange}
                    min="0" max="250" placeholder="e.g., 72"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="SleepDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="SleepDuration"
                    name="SleepDuration"
                    value={formData.SleepDuration}
                    onChange={handleChange}
                    step="0.1" min="0" max="24" placeholder="e.g., 7.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    <span>Predict Health Status</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Data Consent Notice</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              By submitting your health information, you consent to the processing of this data
              solely for generating a health prediction. Your data will not be shared with third
              parties without your consent.
            </p>
          </div>

          {prediction && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Prediction Result</h3>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Predicted Health Status:</p>
                <p className="text-lg font-bold text-emerald-700">{prediction}</p>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                This prediction is generated by the backend endpoint at{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-emerald-600">/predict</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
