const BaseController = require('./BaseController');
const Contact = require('../Modals/Contact');

class ContactController extends BaseController {
    static getContact = BaseController.asyncHandler(async (req, res) => {
        let contact = await Contact.findOne();
        if (!contact) {
            contact = await Contact.create({
                email: 'support@rivora.com',
                phone: '+19 0000000000',
                address: '123 Luxury Lane, Fashion District, NY 10001',
                googleMapsUrl: '',
                socialLinks: [
                    { platform: 'Instagram', url: 'https://instagram.com' },
                    { platform: 'Facebook', url: 'https://facebook.com' },
                    { platform: 'Twitter', url: 'https://twitter.com' }
                ]
            });
        }
        BaseController.sendSuccess(res, 'Contact information retrieved successfully', { contact });
    });

    static updateContact = BaseController.asyncHandler(async (req, res) => {
        const { email, phone, address, googleMapsUrl, socialLinks } = req.body;

        const validSocialLinks = socialLinks ? socialLinks.filter(s => s.url && s.url.trim() !== '') : [];

        let contact = await Contact.findOne();
        if (contact) {
            contact.email = email || contact.email;
            contact.phone = phone || contact.phone;
            contact.address = address || contact.address;
            contact.googleMapsUrl = googleMapsUrl !== undefined ? googleMapsUrl : contact.googleMapsUrl;
            contact.socialLinks = validSocialLinks;
            contact.updatedBy = req.admin?._id;
            await contact.save();
        } else {
            contact = await Contact.create({
                email,
                phone,
                address,
                googleMapsUrl,
                socialLinks: validSocialLinks,
                updatedBy: req.admin?._id
            });
        }

        BaseController.logAction('CONTACT_UPDATE', req, { contactId: contact._id });
        BaseController.sendSuccess(res, 'Contact information updated successfully', { contact });
    });
}

module.exports = ContactController;
