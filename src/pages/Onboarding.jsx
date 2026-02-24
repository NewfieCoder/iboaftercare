// ... imports unchanged ...

export default function Onboarding() {
  // ... existing state ...

  const [ageError, setAgeError] = useState("");

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isAdult = () => {
    const age = calculateAge(birthdate);
    return age !== null && age >= 18;
  };

  const handleComplete = async () => {
    if (!isAdult()) {
      setAgeError("You must be at least 18 years old to use this app.");
      return;
    }
    setAgeError("");
    setSaving(true);

    await base44.entities.UserProfile.create({
      // ... existing fields ...
      age_verified: true,
      // add calculated age if you want (optional)
      // calculated_age: calculateAge(birthdate),
    });
    navigate(createPageUrl("Home"));
  };

  const canProceed = () => {
    if (step === 1) return userType !== "";
    if (step === 2) return confirmed && treatmentDate;
    if (step === 3) return primaryReason;
    if (step === 6) return fullName && birthdate && gender && isAdult();
    return true;
  };

  // In the PERSONAL INFO step (step 6), add below the birthdate input:
  {birthdate && !isAdult() && (
    <p className="text-sm text-red-600 mt-1">
      You must be at least 18 years old to continue.
    </p>
  )}
  {ageError && (
    <p className="text-sm text-red-600 mt-4 text-center font-medium">
      {ageError}
    </p>
  )}

  // ... rest of component unchanged ...
}