const handleSignUp = async (email, password) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('policy')) {
        setError('This email is not authorized. Please contact the administrator for access.')
      } else {
        setError(error.message)
      }
      return
    }

    // ... rest of your sign up logic
  } catch (error) {
    setError('An unexpected error occurred. Please try again.')
  }
}