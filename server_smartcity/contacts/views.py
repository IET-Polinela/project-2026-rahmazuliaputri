from django.views.generic import TemplateView

class ContactView(TemplateView):
    template_name = 'contacts/contacts.html'