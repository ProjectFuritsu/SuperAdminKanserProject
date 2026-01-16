import { useForm, isNotEmpty } from '@mantine/form';
import { Button, Group, Modal, Stack, TextInput, Textarea, Divider, ActionIcon, ScrollArea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPlus, IconListNumbers, IconFileCheck, IconGift } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { addfinancialInsti_benefits, addfinancialInsti_programReq, addfinancialInsti_programs, addfinancialInsti_programsteps, deleteProgramBenefit, deleteProgramRequirement, deleteProgramStep, updateProgram, updateProgramBenefit, updateProgramRequirement, updateProgramStep } from '../../../API/financialInstiAPI';


export default function UpdateProgramModal({ opened, onClose, data, institutionId, onSuccess }) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!data;

    const form = useForm({
        initialValues: {
            program_name: '',
            program_desc: '',
            procedure: [{ step: '' }],
            requirements: [{ requirement: '' }],
            benefits: [{ benefits: '' }],
        },
        validate: {
            program_name: isNotEmpty('Program name is required'),
        },
    });

    useEffect(() => {
        if (opened && isEditing && data) {
            form.setValues({
                program_name: data.program_name || '',
                program_desc: data.program_desc || '',
                procedure: data.program_offer_steps?.map(s => ({ step: s.program_steps_desc })) || [{ step: '' }],
                requirements: data.program_requirements?.map(r => ({ requirement: r.req_details })) || [{ requirement: '' }],
                benefits: data.program_benefits?.map(b => ({ benefits: b.benef_desc })) || [{ benefits: '' }],
            });
        } else if (opened && !isEditing) {
            form.reset();
        }
    }, [opened, data]);

    const submitEntry = async (values) => {
        setIsSubmitting(true);
        try {
            if (isEditing) {
                // 1. Update the main program record
                await updateProgram(data.program_id, {
                    program_name: values.program_name,
                    program_desc: values.program_desc,
                });

                // 2. Process Procedures (Steps)
                const stepPromises = values.procedure.map((item, index) => {
                    const stepId = data.program_offer_steps?.[index]?.program_steps_id;
                    if (stepId) {
                        return updateProgramStep(stepId, { program_steps_desc: item.step });
                    } else if (item.step.trim() !== '') {
                        // This is a NEW step added during editing
                        return addfinancialInsti_programsteps({
                            program_id: data.program_id,
                            program_steps_desc: item.step
                        });
                    }
                    return null;
                });

                // 3. Process Requirements
                const reqPromises = values.requirements.map((item, index) => {
                    const reqId = data.program_requirements?.[index]?.program_req_id;
                    if (reqId) {
                        return updateProgramRequirement(reqId, { req_details: item.requirement });
                    } else if (item.requirement.trim() !== '') {
                        return addfinancialInsti_programReq({
                            program_id: data.program_id,
                            req_details: item.requirement
                        });
                    }
                    return null;
                });

                // 4. Process Benefits
                const benefitPromises = values.benefits.map((item, index) => {
                    const benefId = data.program_benefits?.[index]?.benef_id;
                    if (benefId) {
                        return updateProgramBenefit(benefId, { benef_desc: item.benefits });
                    } else if (item.benefits.trim() !== '') {
                        return addfinancialInsti_benefits({
                            program_id: data.program_id,
                            benef_desc: item.benefits
                        });
                    }
                    return null;
                });

                await Promise.all([
                    ...stepPromises.filter(Boolean),
                    ...reqPromises.filter(Boolean),
                    ...benefitPromises.filter(Boolean)
                ]);

                notifications.show({ title: 'Success', message: 'All changes synced', color: 'green' });

            } else {

                // Standard ADD logic for brand new programs
                const programs = await addfinancialInsti_programs({
                    financial_insti_id: institutionId,
                    program_name: values.program_name,
                    program_desc: values.program_desc,
                });

                // Step B: Capture the new ID
                const programID = programs[0]?.program_id;

                if (programID) {
                    // Step C: Prepare sub-table promises
                    const procedurePromises = values.procedure
                        .filter(proc => proc.step.trim() !== '')
                        .map((proc, index) =>
                            addfinancialInsti_programsteps({
                                program_id: programID,
                                program_steps_desc: proc.step,
                                seq_no: index + 1, // Reference style sequence
                            })
                        );

                    const requirementPromises = values.requirements
                        .filter(req => req.requirement.trim() !== '')
                        .map((req) =>
                            addfinancialInsti_programReq({
                                program_id: programID,
                                req_details: req.requirement,
                            })
                        );

                    const benefitsPromises = values.benefits
                        .filter(ben => ben.benefits.trim() !== '')
                        .map((ben) =>
                            addfinancialInsti_benefits({
                                program_id: programID,
                                benef_desc: ben.benefits,
                            })
                        );

                    // Step D: Execute all child insertions
                    await Promise.all([...procedurePromises, ...requirementPromises, ...benefitsPromises]);
                }
                notifications.show({ title: 'Success', message: 'New program created', color: 'green' });
                onSuccess();
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Sync Error:", error);
            notifications.show({ title: 'Error', message: 'Failed to sync some items', color: 'red' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveStep = async (index) => {
        const stepId = data?.program_offer_steps?.[index]?.program_steps_id;
        if (isEditing && stepId) {
            try {
                await deleteProgramStep(stepId);
                notifications.show({ title: 'Removed', message: 'Step deleted from database', color: 'gray' });
            } catch (error) {
                notifications.show({ title: 'Error', message: 'Failed to delete step', color: 'red' });
                return; // Don't remove from UI if DB delete fails
            }
        }
        form.removeListItem('procedure', index);
    };

    const handleRemoveRequirement = async (index) => {
        const reqId = data?.program_requirements?.[index]?.program_req_id;

        if (isEditing && reqId) {
            try {
                await deleteProgramRequirement(reqId);
                notifications.show({ title: 'Removed', message: 'Requirement deleted', color: 'gray' });
            } catch (error) {
                notifications.show({ title: 'Error', message: 'Failed to delete requirement', color: 'red' });
                return;
            }
        }
        form.removeListItem('requirements', index);
    };


    const handleRemoveBenefit = async (index) => {
        const benefId = data?.program_benefits?.[index]?.benef_id;
        if (isEditing && benefId) {
            try {
                await deleteProgramBenefit(benefId);
                notifications.show({ title: 'Removed', message: 'Benefit deleted', color: 'gray' });
            } catch (error) {
                notifications.show({ title: 'Error', message: 'Failed to delete benefit', color: 'red' });
                return;
            }
        }
        form.removeListItem('benefits', index);
    };

    return (
        <Modal opened={opened} onClose={onClose} title={isEditing ? 'Edit Program' : 'Add Program'} size="lg">
            <form onSubmit={form.onSubmit(submitEntry)}>
                <ScrollArea.Autosize mah={600}>
                    <Stack gap="md">
                        <TextInput label="Program Name" withAsterisk {...form.getInputProps('program_name')} />
                        <Textarea label="Description" {...form.getInputProps('program_desc')} />

                        <Divider label={<Group gap="xs"><IconListNumbers size={16} />Procedure</Group>} labelPosition="center" />
                        {form.values.procedure.map((_, index) => (
                            <Group key={index} align="flex-end">
                                <TextInput style={{ flex: 1 }} label={index === 0 ? "Steps" : null} {...form.getInputProps(`procedure.${index}.step`)} />
                                <ActionIcon color="red" variant="light" onClick={() => handleRemoveStep(index)} disabled={form.values.procedure.length === 1}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        ))}
                        <Button variant="light" size="compact-xs" leftSection={<IconPlus size={14} />} onClick={() => form.insertListItem('procedure', { step: '' })}>Add Step</Button>

                        <Divider label={<Group gap="xs"><IconFileCheck size={16} />Requirements</Group>} labelPosition="center" />
                        {form.values.requirements.map((_, index) => (
                            <Group key={index} align="flex-end">
                                <TextInput style={{ flex: 1 }} label={index === 0 ? "Requirement" : null} {...form.getInputProps(`requirements.${index}.requirement`)} />
                                <ActionIcon color="red" variant="light" onClick={() => handleRemoveRequirement(index)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        ))}
                        <Button variant="light" color="orange" size="compact-xs" leftSection={<IconPlus size={14} />} onClick={() => form.insertListItem('requirements', { requirement: '' })}>Add Requirement</Button>

                        <Divider label={<Group gap="xs"><IconGift size={16} />Benefits</Group>} labelPosition="center" />
                        {form.values.benefits.map((_, index) => (
                            <Group key={index} align="flex-end">
                                <TextInput style={{ flex: 1 }} label={index === 0 ? "Benefit" : null} {...form.getInputProps(`benefits.${index}.benefits`)} />
                                <ActionIcon color="red" variant="light" onClick={() => handleRemoveBenefit(index)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        ))}
                        <Button variant="light" color="green" size="compact-xs" leftSection={<IconPlus size={14} />} onClick={() => form.insertListItem('benefits', { benefits: '' })}>Add Benefit</Button>

                        <Group justify="flex-end" mt="xl">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" loading={isSubmitting}>{isEditing ? 'Save Changes' : 'Create Program'}</Button>
                        </Group>
                    </Stack>
                </ScrollArea.Autosize>
            </form>
        </Modal>
    )
}
