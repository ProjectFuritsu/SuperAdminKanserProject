import { useForm } from '@mantine/form';
import { Button, Group, Modal, Stack, TextInput, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useEffect } from 'react';
import { addhealthInsti_contacts, updatehealthInstiContact } from '../../../API/healthInstiAPI';
// Assuming your API functions follow this naming convention

export default function HealthInstiContactModal({ opened, onClose, contact, onSave, health_insti_ID }) {
    const isEditing = !!contact?.contact_id;

    const form = useForm({
        initialValues: {
            contact_type: 'Mobile',
            contact_detail: '',
            health_insti_ID: health_insti_ID || ''
        },
        validate: {
            contact_type: (value) => (!value ? 'Select a type' : null),
            contact_detail: (value, values) => {
                const type = values.contact_type;
                if (!value) return 'Contact detail is required';

                if (type === 'Email') {
                    if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
                }

                if (type === 'Mobile') {
                    if (!/^\d+$/.test(value)) return 'Numbers only';
                    if (value.length !== 11) return 'Mobile number must be exactly 11 digits';
                }

                if (type === 'Landline') {
                    if (!/^\d+$/.test(value)) return 'Numbers only';
                    if (value.length < 7 || value.length > 9)
                        return 'Landline must be between 7 and 9 digits';
                }

                return null;
            },
        },
    });

    // Reset or Set values when modal opens
    useEffect(() => {
        if (opened) {
            if (contact) {
                form.setValues({
                    contact_type: contact.contact_type || 'Mobile',
                    contact_detail: contact.contact_detail || '',
                });
            } else {
                form.reset();
            }
        }
    }, [opened, contact]);

    const handleSubmit = async (values) => {
        try {
            let savedContact;

            if (isEditing) {
                // Update existing health contact
                savedContact = await updatehealthInstiContact(
                    contact.contact_id,
                    {
                        contact_type: values.contact_type,
                        contact_detail: values.contact_detail,
                    }
                );
            } else {
                // Add new health contact
                savedContact = await addhealthInsti_contacts({
                    contact_type: values.contact_type,
                    contact_detail: values.contact_detail,
                    health_insti_id: health_insti_ID
                });
            }

            onSave(savedContact);

            notifications.show({
                title: 'Success',
                message: `Contact ${isEditing ? 'updated' : 'added'} successfully`,
                color: 'green',
            });

            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: 'Error',
                message: `Failed to ${isEditing ? 'update' : 'add'} contact`,
                color: 'red',
            });
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={isEditing ? 'Edit Health Contact' : 'Add Health Contact'}
            size="sm"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack spacing="md">
                    <Select
                        label="Type"
                        placeholder="Select type"
                        data={['Mobile', 'Landline', 'Email', 'Facebook', 'Website']}
                        {...form.getInputProps('contact_type')}
                    />
                    <TextInput
                        label="Detail"
                        withAsterisk
                        {...form.getInputProps('contact_detail')}
                        type={
                            form.values.contact_type === 'Email' ? 'email' :
                                (form.values.contact_type === 'Mobile' || form.values.contact_type === 'Landline') ? 'tel' : 'text'
                        }
                        placeholder={
                            form.values.contact_type === 'Email' ? 'e.g hello@domain.com' :
                                form.values.contact_type === 'Mobile' ? 'e.g 09123456789' :
                                    form.values.contact_type === 'Landline' ? 'e.g 2345678' : 'Enter contact detail'
                        }
                        onKeyPress={(event) => {
                            const type = form.values.contact_type;
                            const value = form.values.contact_detail;

                            if ((type === 'Mobile' || type === 'Landline') && !/[0-9]/.test(event.key)) {
                                event.preventDefault();
                            }

                            if ((type === 'Mobile' && value.length >= 11) || (type === 'Landline' && value.length >= 9)) {
                                event.preventDefault();
                            }
                        }}
                    />

                    <Group position="right" mt="md">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" leftIcon={<IconCheck size={16} />}>
                            {isEditing ? 'Save Changes' : 'Add Contact'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}