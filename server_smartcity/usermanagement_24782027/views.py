from django.contrib import messages
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import CreateView

from .forms import CustomUserRegisterForm
from .models import CustomUser


class CustomLoginView(LoginView):
    template_name = 'usermanagement_24782027/login.html'
    redirect_authenticated_user = True

    def form_valid(self, form):
        messages.success(self.request, 'Login berhasil.')
        return super().form_valid(form)


class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('login')

    def post(self, request, *args, **kwargs):
        auth_logout(request)
        messages.success(request, 'Logout berhasil.')
        return redirect(self.next_page)


class RegisterView(CreateView):
    model = CustomUser
    form_class = CustomUserRegisterForm
    template_name = 'usermanagement_24782027/register.html'
    success_url = reverse_lazy('login')

    def form_valid(self, form):
        messages.success(self.request, 'Registrasi berhasil. Silakan login.')
        return super().form_valid(form)