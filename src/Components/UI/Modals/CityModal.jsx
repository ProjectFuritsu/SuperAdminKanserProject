import { isNotEmpty, useForm } from '@mantine/form';
import React, { useEffect, useState } from 'react'
import { addcity, updatecity } from '../../../API/Utils/HealthInstiUtils';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function CityModal({
    opened,
    onClose,
    data,
    onSuccess
}) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!data;


    const form = useForm({
        initialValues: {
            city_zip_code: data?.city_zip_code || '',
            city_name: data?.city_name || '',
        },
        validate: {
            city_zip_code: isNotEmpty('Zip Code cannot be empty'),
            city_name: isNotEmpty('City name cannot be empty'),
        },
    });


    useEffect(() => {
        // Only run this logic when the modal state changes or the data changes
        if (opened && isEditing && data) {
            // Set values for EDITING mode
            form.setValues({
                city_zip_code: data.city_zip_code,
                city_name: data.city_name,
            });

        } else if (opened && !isEditing) {
            // Reset the form values for ADDING mode when the modal opens
            form.reset();
        }
    }, [opened, data]);


    const submitEntry = async (values) => {
        setIsSubmitting(true);

        try {
            if (isEditing) {
                // --- 1. UPDATE LOGIC ---
                await updatecity(data.city_zip_code, {
                    city_zip_code: values.city_zip_code,
                    city_name: values.city_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Update Successful',
                    message: `${data.city_name} was updated successfully.`,
                });

                form.reset();

            } else {
                // --- 2. ADD LOGIC ---
                await addcity({
                    city_zip_code: values.city_zip_code,
                    city_name: values.city_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Added Successfuly',
                    message: 'New city was added successfuly👌',
                });
                form.reset();

            }

            // Call the success handler passed from the parent component (to trigger fetchTypes())
            onSuccess();
            onClose(); // Close the modal

        } catch (error) {
            console.error('API Error:', error);
            notifications.show({
                color: "red",
                title: 'Operation Failed',
                message: `Could not ${isEditing ? 'update' : 'add'} the publication type.`,
            });
            form.reset();
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalTitle = isEditing ?
        `Edit City Detail` :
        'Add New City';


    return (
        <>
            <Modal opened={opened} onClose={onClose} title={modalTitle} centered>
                <form onSubmit={form.onSubmit(submitEntry)}>
                    <Stack>
                        <TextInput
                            label="City Zip Code"
                            description="Please verify the code first before the insertion"
                            placeholder="ex. 8923"
                            withAsterisk
                            type="number"
                            {...form.getInputProps('city_zip_code')}
                            disabled={isSubmitting}
                        />
                        <TextInput
                            label="City name"
                            description="Please check the name first before the insertion"
                            placeholder="ex. Davao de Oro"
                            withAsterisk
                            {...form.getInputProps('city_name')}
                            disabled={isSubmitting}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={isSubmitting}>
                                {isEditing ? 'Save Changes' : 'Add City'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    )
}
