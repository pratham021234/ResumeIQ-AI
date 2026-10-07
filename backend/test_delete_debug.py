import requests

login = requests.post('http://127.0.0.1:8000/api/auth/login', json={'email':'demo@resumeiq.ai','password':'password123'}).json()
token = login['access_token']
headers = {'Authorization': 'Bearer ' + token}

rid = '08b38c99-8517-45be-a729-2bd720d7212c'
print(f'Attempting to delete resume with analysis: {rid}')
res = requests.delete(f'http://127.0.0.1:8000/api/resumes/{rid}', headers=headers)
print('Status:', res.status_code)
print('Response:', res.text)
