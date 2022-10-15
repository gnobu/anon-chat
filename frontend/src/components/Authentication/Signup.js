import React, { useEffect, useState } from 'react';
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Signup = () => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const [signatureRes, setSignatureRes] = useState();

    useEffect(() => {
        const getSignature = async () => {
            const signatureResponse = await axios.get("api/user/get-signature");
            setSignatureRes(signatureResponse.data);
        }

        // getSignature();
        setTimeout(() => {
            getSignature();
        }, 5000);
    }, []);

    const postDetails = async (img) => {
        setLoading(true);
        if (img === undefined) {
            toast({
                title: 'NO IMAGE!',
                description: "Please select an image.",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            })
        }
        if (img?.type === 'image/jpeg' || img?.type === 'image/png') {
            const data = new FormData();
            console.log(data);
            data.append("file", img);
            data.append("api_key", signatureRes?.api_key)
            data.append("signature", signatureRes?.signature);
            data.append("timestamp", signatureRes?.timestamp);

            console.log(data);

            try {
                const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${signatureRes?.cloud_name}/auto/upload`, data, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
                console.log(cloudinaryResponse.data);
                setPic({
                    public_id: cloudinaryResponse.data?.public_id,
                    version: cloudinaryResponse.data?.version,
                    signature: cloudinaryResponse.data?.signature,
                });
            } catch (error) {
                console.log(error);
                if(error.response.data.message.includes('Stale request')){
                    toast({
                        title: "Error Occured!",
                        description: "Session timeout. Please refresh the page and try again",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                } else {
                    toast({
                        title: "Error Occured!",
                        description: error.response.data.message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            }
        } else {
            toast({
                title: 'NO IMAGE!',
                description: "Please select an image.",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            })
        }
        setLoading(false);
    }

    const submitHandler = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
            toast({
                title: 'Please fill all the fields!',
                description: "One or more required fields is empty.",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            })
            setLoading(false);
            return;
        }
        if (password !== confirmpassword) {
            toast({
                title: "Passwords Do Not Match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
        try {
            const { data } = await axios.post(
                "/api/user",
                {
                    name,
                    email,
                    password,
                    pic,
                }
            );
            console.log(data);
            toast({
                title: "Registration Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/chats');
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
        }
        setLoading(false);
    }

    return (
        <VStack spacing='5px'>
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder='Enter your name'
                    onChange={e => setName(e.target.value)}
                />
            </FormControl>

            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder='Enter your email'
                    onChange={e => setEmail(e.target.value)}
                />
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder='Enter your password'
                        onChange={e => setPassword(e.target.value)}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={e => setShow(!show)}>
                            {show ? 'hide' : 'show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id='confirm-password' isRequired>
                <FormLabel>Confirm Pasword</FormLabel>
                <InputGroup size='md'>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder='Confirm your password'
                        onChange={e => setConfirmpassword(e.target.value)}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={e => setShow(!show)}>
                            {show ? 'hide' : 'show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id="pic">
                <FormLabel>Upload your Picture</FormLabel>
                <Input
                    type="file"
                    p={1.5}
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>

            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Sign Up
            </Button>
        </VStack>
    )
}

export default Signup