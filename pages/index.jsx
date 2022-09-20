import Head from 'next/head';
import Container from '@mui/material/Container';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { labels } from '../lib/labels';

export default function Index() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [contact, setContact] = useState('');

  const [imageUrl, setImageUrl] = useState();
  const [file, setFile] = useState();
  const [prediction, setPrediction] = useState();

  const [currentPage, setCurrentPage] = useState('personal-info');

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setCurrentPage('classification');
  };
  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;

    const files = e.target.files;
    const file = files[0];
    setFile(file);
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      alert('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      const base64Image = reader.result;
      setImageUrl(base64Image);
    };
  };

  const classify = () => {
    if (!imageUrl) return;
    predict();
  };

  const predict = async () => {
    const img = document.createElement('img');
    img.width = 28;
    img.height = 28;
    img.src = URL.createObjectURL(file);

    const model = await tf.loadLayersModel('/tfjs/model.json');
    const imageTensor = tf.browser.fromPixels(img)
      .expandDims(0)
      .expandDims(-1)
      .div(255.0)
      .reshape([-1, 28, 28, 3]);

    const pred = model.predict(imageTensor);
    const results = await pred.data();
    const max = Math.max(...results);
    const index = results.findIndex((r) => r === max);
    const prediction = { confidence: max, type: labels[index] };
    setPrediction(prediction);
    console.log(prediction);
    setCurrentPage('result');
  };

  return <>
    <Head> <title> ASCADES </title> </Head>
    {currentPage === 'personal-info' &&
      <form onSubmit={handleFormSubmit}>
        <Container style={{ width: 'min(500px,100%)' }}>
          <Stack spacing={4} mt={4}>
            <Typography variant='h4'> Personal Information </Typography>
            <TextField
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              id="name"
              label="Name"
              name='name'
              variant="outlined" />
            <TextField
              required
              value={age}
              onChange={(event) => setAge(event.target.value)}
              id="age"
              label="Age"
              name='age'
              variant="outlined"
              type='number' />
            <FormControl>
              <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="female"
                name="radio-buttons-group"
                row value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <FormControlLabel value="female" control={<Radio />} label="Female" />
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="other" control={<Radio />} label="Other" />
              </RadioGroup>
            </FormControl>
            <TextField
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              id="contact-number"
              label="Contact number"
              name='contact-number'
              variant="outlined" />

            <Button
              type="submit"
              fullWidth
              size='large'
              variant='contained'>
              Next
            </Button>
          </Stack>
        </Container>
      </form>}

    {currentPage === 'classification' &&
      <Container style={{ width: 'min(500px,100%)' }}>
        <Stack spacing={4} my={18}>
          <Paper elevation={3}>
            {imageUrl == null
              ? <Typography p={8} align='center'>
                No image is selected
              </Typography>
              // eslint-disable-next-line @next/next/no-img-element
              : <img
                id='skin-image'
                src={imageUrl}
                style={{ width: '100%' }}
                alt='image' />}
          </Paper>
          <Button
            variant="outlined"
            component="label"
          >
            {imageUrl == null ? 'Select Image' : 'Select another Image'}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          <Button
            onClick={classify}
            disabled={imageUrl == null}
            variant="contained"
            component="label"
          >
            Classify
          </Button>
        </Stack>
      </Container>
    }
    {currentPage === 'result' &&
      <Container style={{ width: 'min(500px,100%)' }}>
        <Stack spacing={4} my={18}>
          <Typography variant='h4'>
            Personal Information
          </Typography>
          <Typography>
            Name: {name}
          </Typography>
          <Typography>
            Age: {age}
          </Typography>
          <Typography>
            Gender: {gender}
          </Typography>
          <Typography>
            Contact: {contact}
          </Typography>
          <Typography variant='h4'>
            External Synopsis Imagery
          </Typography>
          <Typography>
            Diagnosis: {prediction.type.label}
          </Typography>
          <Typography>
            Description: {prediction.type.description}
          </Typography>
          <Typography>
            Recommendation: {""}
          </Typography>
        </Stack>
      </Container>}
  </>;
}