from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from django.contrib.auth.models import User
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    PasswordChangeSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer
)
from .models import OTPVerification, PendingRegistration
import random
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user'] #type: ignore
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            logout(request)
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password']) #type: ignore
            user.save()
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth(request):
    """Check if user is authenticated and return user info"""
    return Response({
        'authenticated': True,
        'user': UserProfileSerializer(request.user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_request(request):
    email = request.data.get('email')
    username = request.data.get('username')
    if not all([email, username]):
        return Response({'error': 'Email and username are required.'}, status=400)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered.'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=400)
    otp = str(random.randint(100000, 999999))
    PendingRegistration.objects.update_or_create(
        email=email,
        defaults={
            'username': username,
            'otp': otp,
            'is_verified': False
        }
    )
    send_mail(
        subject='Your FinWise Registration OTP',
        message=f'Your OTP code is: {otp}',
        from_email='no-reply@finwise.com',
        recipient_list=[email],
        fail_silently=False,
    )
    return Response({'message': 'OTP sent to email.'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_registration_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    password = request.data.get('password')
    confirm_password = request.data.get('confirmPassword')
    if not all([email, otp, password, confirm_password]):
        return Response({'error': 'All fields are required.'}, status=400)
    if password != confirm_password:
        return Response({'error': 'Passwords do not match.'}, status=400)
    try:
        pending = PendingRegistration.objects.get(email=email)
    except PendingRegistration.DoesNotExist:
        return Response({'error': 'No pending registration for this email.'}, status=404)
    if pending.otp != otp:
        return Response({'error': 'Invalid OTP.'}, status=400)
    user = User.objects.create_user(
        username=pending.username,
        email=pending.email,
        password=password
    )
    pending.delete()
    return Response({'message': 'Registration complete. You can now log in.'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp(request):
    serializer = SendOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = str(random.randint(100000, 999999))
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=404)
        OTPVerification.objects.update_or_create(user=user, defaults={'otp': otp, 'is_verified': False})
        send_mail(
            subject='Your FinWise OTP Verification Code',
            message=f'Your OTP code is: {otp}',
            from_email='no-reply@finwise.com',
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'OTP sent.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        try:
            user = User.objects.get(email=email)
            otp_obj = OTPVerification.objects.get(user=user)
            if otp_obj.otp == otp:
                otp_obj.is_verified = True
                otp_obj.save()
                return Response({'message': 'OTP verified.'})
            else:
                return Response({'error': 'Invalid OTP.'}, status=400)
        except (User.DoesNotExist, OTPVerification.DoesNotExist):
            return Response({'error': 'User or OTP not found.'}, status=404)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password_send_otp(request):
    email_or_username = request.data.get('email_or_username')
    if not email_or_username:
        return Response({'error': 'Email or username is required.'}, status=400)
    user = User.objects.filter(email=email_or_username).first() or User.objects.filter(username=email_or_username).first()
    if not user:
        return Response({'error': 'User not found.'}, status=404)
    email = user.email
    otp = str(random.randint(100000, 999999))
    OTPVerification.objects.update_or_create(user=user, defaults={'otp': otp, 'is_verified': False})
    send_mail(
        subject='Your FinWise Password Reset OTP',
        message=f'Your OTP code for password reset is: {otp}',
        from_email='no-reply@finwise.com',
        recipient_list=[email],
        fail_silently=False,
    )
    # IMPORTANT: Return the resolved email!
    return Response({'message': 'OTP sent for password reset.', 'email': email})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password_verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        try:
            user = User.objects.get(email=email)
            otp_obj = OTPVerification.objects.get(user=user)
            if otp_obj.otp == otp:
                otp_obj.is_verified = True
                otp_obj.save()
                return Response({'message': 'OTP verified for password reset.'})
            else:
                return Response({'error': 'Invalid OTP.'}, status=400)
        except (User.DoesNotExist, OTPVerification.DoesNotExist):
            return Response({'error': 'User or OTP not found.'}, status=404)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    if not email or not new_password:
        return Response({'error': 'Email and new password are required.'}, status=400)
    try:
        user = User.objects.get(email=email)
        otp_obj = OTPVerification.objects.get(user=user)
        if not otp_obj.is_verified:
            return Response({'error': 'OTP not verified.'}, status=400)
        user.set_password(new_password)
        user.save()
        otp_obj.is_verified = False  # Reset OTP verification
        otp_obj.save()
        return Response({'message': 'Password reset successful.'})
    except (User.DoesNotExist, OTPVerification.DoesNotExist):
        return Response({'error': 'User or OTP not found.'}, status=404)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    profile = request.user.userprofile
    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
