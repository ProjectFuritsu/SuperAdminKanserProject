import { useForm, isNotEmpty } from '@mantine/form';
import { Button, Group, Modal, Stack, TextInput, Textarea, Divider, ActionIcon, ScrollArea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPlus, IconListNumbers, IconFileCheck, IconStethoscope } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { addhealthInsti_services, addhealthInsti_services_procedures, addhealthInsti_services_requirements, deleteServiceProcedure, deleteServiceRequirement, updateHealthService, updateServiceProcedure, updateServiceRequirement } from '../../../API/healthInstiAPI';
// Import your health institution API functions here


export default function UpdateServiceModal({ opened, onClose, data, institutionId, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!data;

    const form = useForm({
        initialValues: {
            service_name: '',
            service_desc: '',
            procedure: [{ procedure_desc: '' }],
            requirements: [{ req_desc: '' }],
        },
        validate: {
            service_name: isNotEmpty('Service name is required'),
        },
    });

    useEffect(() => {
        if (opened && isEditing && data) {
            form.setValues({
                service_name: data.service_name || '',
                service_desc: data.service_desc || '',
                procedure: data.services_procedure?.map(s => ({ procedure_desc: s.procedure_desc })) || [{ procedure_desc: '' }],
                requirements: data.service_requirements?.map(r => ({ req_desc: r.req_desc })) || [{ req_desc: '' }],
            });
        } else if (opened && !isEditing) {
            form.reset();
        }
    }, [opened, data]);

    const submitEntry = async (values) => {
        setIsSubmitting(true);
        try {
            if (isEditing) {
                // 1. Update the main service record
                await updateHealthService(data.service_id, {
                    service_name: values.service_name,
                    service_desc: values.service_desc,
                });

                // 2. Sync Procedures
                const stepPromises = values.procedure.map((item, index) => {
                    const stepId = data.services_procedure?.[index]?.procedure_id;
                    if (stepId) {
                        return updateServiceProcedure(stepId, { procedure_desc: item.procedure_desc });
                    } else if (item.procedure_desc.trim() !== '') {
                        return addhealthInsti_services_procedures({
                            service_id: data.service_id,
                            procedure_desc: item.procedure_desc
                        });
                    }
                    return null;
                });

                // 3. Sync Requirements
                const reqPromises = values.requirements.map((item, index) => {
                    const reqId = data.service_requirements?.[index]?.req_id;
                    if (reqId) {
                        return updateServiceRequirement(reqId, { req_desc: item.req_desc });
                    } else if (item.req_desc.trim() !== '') {
                        return addhealthInsti_services_requirements({
                            service_id: data.service_id,
                            req_desc: item.req_desc
                        });
                    }
                    return null;
                });

                await Promise.all([...stepPromises.filter(Boolean), ...reqPromises.filter(Boolean)]);
                notifications.show({ title: 'Success', message: 'Service updated successfully', color: 'green' });

            } else {
                // ADD logic for brand new service
                const newService = await addhealthInsti_services({
                    health_insti_id: institutionId,
                    service_name: values.service_name,
                    service_desc: values.service_desc,
                });

                const serviceID = newService[0]?.service_id;

                if (serviceID) {
                    const procedurePromises = values.procedure
                        .filter(p => p.procedure_desc.trim() !== '')
                        .map(p => addhealthInsti_services_procedures({ service_id: serviceID, procedure_desc: p.procedure_desc }));

                    const requirementPromises = values.requirements
                        .filter(r => r.req_desc.trim() !== '')
                        .map(r => addhealthInsti_services_requirements({ service_id: serviceID, req_desc: r.req_desc }));

                    await Promise.all([...procedurePromises, ...requirementPromises]);
                }
                notifications.show({ title: 'Success', message: 'New service created', color: 'green' });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Sync Error:", error);
            notifications.show({ title: 'Error', message: 'Failed to sync service data', color: 'red' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveStep = async (index) => {
        const stepId = data?.services_procedure?.[index]?.procedure_id;
        if (isEditing && stepId) {
            try {
                await deleteServiceProcedure(stepId);
            } catch (error) { return; }
        }
        form.removeListItem('procedure', index);
    };

    const handleRemoveReq = async (index) => {
        const reqId = data?.service_requirements?.[index]?.req_id;
        if (isEditing && reqId) {
            try {
                await deleteServiceRequirement(reqId);
            } catch (error) { return; }
        }
        form.removeListItem('requirements', index);
    };

    return (
        <Modal opened={opened} onClose={onClose} title={isEditing ? 'Edit Health Service' : 'Add Health Service'} size="lg">
            <form onSubmit={form.onSubmit(submitEntry)}>
                <ScrollArea.Autosize mah={600}>
                    <Stack gap="md">
                        <TextInput label="Service Name" placeholder="e.g. Laboratory, Dental" withAsterisk {...form.getInputProps('service_name')} />
                        <Textarea label="Description" placeholder="Brief overview of the service" {...form.getInputProps('service_desc')} />

                        <Divider label={<Group gap="xs"><IconListNumbers size={16} />Application Process</Group>} labelPosition="center" />
                        {form.values.procedure.map((_, index) => (
                            <Group key={index} align="flex-end">
                                <TextInput style={{ flex: 1 }} label={index === 0 ? "Steps" : null} {...form.getInputProps(`procedure.${index}.procedure_desc`)} />
                                <ActionIcon color="red" variant="light" onClick={() => handleRemoveStep(index)} disabled={form.values.procedure.length === 1}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        ))}
                        <Button variant="light" size="compact-xs" leftSection={<IconPlus size={14} />} onClick={() => form.insertListItem('procedure', { procedure_desc: '' })}>Add Step</Button>

                        <Divider label={<Group gap="xs"><IconFileCheck size={16} />Service Requirements</Group>} labelPosition="center" />
                        {form.values.requirements.map((_, index) => (
                            <Group key={index} align="flex-end">
                                <TextInput style={{ flex: 1 }} label={index === 0 ? "Requirement" : null} {...form.getInputProps(`requirements.${index}.req_desc`)} />
                                <ActionIcon color="red" variant="light" onClick={() => handleRemoveReq(index)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        ))}
                        <Button variant="light" color="orange" size="compact-xs" leftSection={<IconPlus size={14} />} onClick={() => form.insertListItem('requirements', { req_desc: '' })}>Add Requirement</Button>

                        <Group justify="flex-end" mt="xl">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" loading={isSubmitting}>{isEditing ? 'Save Changes' : 'Create Service'}</Button>
                        </Group>
                    </Stack>
                </ScrollArea.Autosize>
            </form>
        </Modal>
    );
}