import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FlashcardPage = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/flashcards', { replace: true }); }, [navigate]);
  return null;
};

export default FlashcardPage;
