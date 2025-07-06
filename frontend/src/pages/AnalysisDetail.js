import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AnalysisDetail = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analysis Detail
      </Typography>
      <Box>
        <Typography variant="body1">
          Analysis detail page - Coming soon!
        </Typography>
      </Box>
    </Container>
  );
};

export default AnalysisDetail;
