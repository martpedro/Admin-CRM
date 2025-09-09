// Script de prueba para verificar la integración con la API
console.log('=== Prueba de Integración API ===');

// Verificar token en localStorage
const token = localStorage.getItem('serviceToken');
console.log('Token en localStorage:', token ? 'Presente' : 'No encontrado');

if (token) {
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Probar endpoint de usuarios
    fetch('http://localhost:3003/api/user/list?index=1&count=5', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Respuesta usuarios - Status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Datos usuarios:', data);
        console.log('Número de usuarios:', data.Message?.data?.length || 0);
    })
    .catch(error => {
        console.error('Error usuarios:', error);
    });

    // Probar endpoint de clientes
    fetch('http://localhost:3003/api/Customer/list?index=1&count=5', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Respuesta clientes - Status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Datos clientes:', data);
        console.log('Número de clientes:', data.Message?.data?.length || 0);
    })
    .catch(error => {
        console.error('Error clientes:', error);
    });
} else {
    console.log('❌ No hay token disponible. Usar update-token.html primero.');
}

console.log('=== Fin de Prueba ===');
