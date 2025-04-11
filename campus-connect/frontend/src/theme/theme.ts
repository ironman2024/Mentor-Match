export const authStyles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8F9FB',
      py: 4
    },
    paper: {
      borderRadius: '24px',
      p: { xs: 3, sm: 6 },
      width: '100%',
      maxWidth: 'sm',
      border: '1px solid #B5BBC9',
      boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
      background: 'white',
    },
    title: {
      color: '#585E6C',
      fontWeight: 700,
      fontSize: { xs: '1.8rem', sm: '2.2rem' },
      mb: 4
    },
    input: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        '&:hover fieldset': {
          borderColor: '#585E6C',
        },
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#B5BBC9',
      },
      mb: 2
    },
    button: {
      mt: 4,
      py: 1.5,
      borderRadius: '30px',
      background: '#585E6C',
      fontSize: '1rem',
      textTransform: 'none',
      '&:hover': {
        background: '#474D59',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
      }
    }
  };
  