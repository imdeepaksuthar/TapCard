import re
import os

filepath = r'c:\laragon\www\TapCard\app\login\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state for needsVerification
state_insert = """  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);"""
content = re.sub(r'  const \[isLoading, setIsLoading\] = useState\(false\);', state_insert, content, count=1)

# 2. Add handleResendVerification
resend_func = """
  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await apiFetch('/api/email/verification-notification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setError('Verification link sent! Please check your email.');
      setNeedsVerification(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {"""
content = re.sub(r'\n  const handleSendOTP = async \(\) => {', resend_func, content, count=1)

# 3. Update handleSubmit catch block
catch_block = """    } catch (err: any) {
      if (err.data?.needs_verification) {
        setError(err.message);
        setNeedsVerification(true);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {"""
content = re.sub(r'    } catch \(err: any\) \{\s*setError\(err\.message \|\| \'Authentication failed\. Please try again\.\'\);\s*\} finally \{', catch_block, content, count=1)

# 4. Update the error render block
error_render = """          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid #ef4444',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '24px',
              fontSize: '13px',
              fontWeight: 500
            }}>
              {error}
              {needsVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  style={{ display: 'block', marginTop: '8px', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}"""
content = re.sub(r'          \{error && \(\s*<div style=\{\{\s*background: \'rgba\(239, 68, 68, 0\.1\)\',\s*borderLeft: \'4px solid #ef4444\',\s*color: \'#fca5a5\',\s*padding: \'12px 16px\',\s*borderRadius: \'0 8px 8px 0\',\s*marginBottom: \'24px\',\s*fontSize: \'13px\',\s*fontWeight: 500\s*\}\}>\s*\{error\}\s*<\/div>\s*\)\}', error_render, content, count=1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated login page.")
