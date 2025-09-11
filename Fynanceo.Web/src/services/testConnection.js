export const testAPIConnection = async () => {
    try {
        const response = await fetch('https://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@fynanceo.com',
                password: 'admin123'
            })
        });

        console.log('Status:', response.status);
        console.log('Response:', await response.text());
        return response;
    } catch (error) {
        console.error('Erro de conexão:', error);
        throw error;
    }
};