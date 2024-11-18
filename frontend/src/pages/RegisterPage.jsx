import {useState, useEffect } from 'react'
import { FaUser } from 'react-icons/fa';

const RegisterPage = () => {
  const [ formData, setFormData ] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const { name, email, password, passwordConfirm } = formData;

  const onChange = () => {}
  
  return (
    <>
      <section className='bg-blue-50 px-4 py-6'>
        <h1>
          <FaUser /> Register
        </h1>
        <p>Create Your Account</p>
      </section>

      <section className='width-70% margin-0-auto'>
        <form>
          <div className='block mb-1 ml-1'>
            <input 
              type='text' 
              className='w-full px-3 py-2 border border-gray-200 rounded-md font-inherit mb-2 focus:outline-none focus:border-blue-500' 
              id='name' 
              value={name} 
              placeholder='Enter your Name' 
              onChange={onChange}
            />
          </div>
        </form>
      </section>
    </>
  )
}

export default RegisterPage