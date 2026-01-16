import { useEffect, useState } from 'react';
import { Stepper, Button, Group, TextInput, Flex, Select, SimpleGrid, Divider, Title, Box, Text, ActionIcon, Paper, Stack, Badge, Modal, NumberInput, List, ThemeIcon, TypographyStylesProvider } from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import { isNotEmpty, useForm, formRootRule } from '@mantine/form';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { RichTextEditor } from '@mantine/tiptap';
import { addhealthInsti, addhealthInsti_contacts, addhealthInsti_desc, addhealthInsti_ophr, addhealthInsti_services, addhealthInsti_services_procedures, addhealthInsti_services_requirements } from '../../../API/healthInstiAPI';
import { useDisclosure } from '@mantine/hooks';
import Placeholder from '@tiptap/extension-placeholder';
import { getprovinces, getcity, getbarangay, getpurok, } from '../../../API/Utils/HealthInstiUtils'
import { IconBold, IconCirclePlus, IconInfoCircle, IconMapPin, IconPlus,  IconTrash, IconCircleCheck, IconSettings2, IconPhone } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';


export default function AddhealthInstiStepper({ onSubmitSuccess }) {
    const [active, setActive] = useState(0);
    const nextStep = () => {
        let canProceed = true;

        if (active === 0) {
            // Validate Basic Details
            const result = form.validateField('institutionName');
            const locResult = [
                form.validateField('purok'),
                form.validateField('barangay'),
                form.validateField('city'),
                form.validateField('province'),
                form.validateField('latitude'),
                form.validateField('longitude')
            ];
            if (result.hasError || locResult.some(r => r.hasError)) canProceed = false;
        }

        if (active === 1) {
            // Validate Description
            const result = form.validateField('description');
            if (result.hasError) canProceed = false;
        }

        if (active === 2) {
            // Validate Operating Hours (loops through the array)
            const result = form.validateField('ophr');
            form.values.ophr.forEach((_, index) => {
                form.validateField(`ophr.${index}.day`);
                form.validateField(`ophr.${index}.start`);
                form.validateField(`ophr.${index}.end`);
            });
            if (result.hasError) canProceed = false;
        }

        if (active === 3) {
            // Validate Services, Procedures, and Requirements
            const result = form.validateField('services');
            form.values.services.forEach((service, sIndex) => {
                form.validateField(`services.${sIndex}.name`);
                form.validateField(`services.${sIndex}.description`);
                service.procedures.forEach((_, pIndex) => {
                    form.validateField(`services.${sIndex}.procedures.${pIndex}.step`);
                });
                service.requirements.forEach((_, rIndex) => {
                    form.validateField(`services.${sIndex}.requirements.${rIndex}.item`);
                });
            });
            if (result.hasError) canProceed = false;
        }

        if (active === 4) {
            // Validate Contacts
            const result = form.validateField('contacts');
            form.values.contacts.forEach((_, index) => {
                form.validateField(`contacts.${index}.contact_type`);
                form.validateField(`contacts.${index}.contact_detail`);
            });
            if (result.hasError) canProceed = false;
        }

        // Only move forward if the current step is valid
        if (canProceed) {
            setActive((current) => (current < 5 ? current + 1 : current));
        }
    };
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));


    const [province, setprovince] = useState([]);
    const [city, setcity] = useState([]);
    const [brgy, setbrgy] = useState([]);
    const [purok, setpurok] = useState([]);


    const [isSourceCodeModeActive, onSourceCodeTextSwitch] = useState(false)

    const [opened, { open, close }] = useDisclosure(false);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, { toggle }] = useDisclosure();

    const form = useForm({
        mode: 'uncontrolled',
        validateInputOnChange: false,
        initialValues: {
            institutionName: '',
            purok: '',
            barangay: '',
            city: '',
            province: '',
            longitude: '',
            latitude: '',
            description: '',
            contacts: [{ contact_type: '', contact_detail: '' }],
            ophr: [{ day: '', start: '', end: '' }],
            services: [
                {
                    name: '',
                    description: '',
                    procedures: [{ step: '' }],
                    requirements: [{ item: '' }]
                }
            ],
        },
        validate: {
            // Basic Details
            institutionName: isNotEmpty('Institution Name is required'),
            purok: (value) => (!value ? 'Purok is required' : null),
            barangay: (value) => (!value ? 'Barangay is required' : null),
            city: (value) => (!value ? 'City is required' : null),
            province: (value) => (!value ? 'Province is required' : null),
            // Coordinates (Basic regex for numbers/decimals)
            latitude: (value) => (!/^-?\d+(\.\d+)?$/.test(value) ? 'Invalid latitude' : null),
            longitude: (value) => (!/^-?\d+(\.\d+)?$/.test(value) ? 'Invalid longitude' : null),
            description: isNotEmpty('Description is required'),

            ophr: {
                [formRootRule]: isNotEmpty('At least one operating hour is required'),
                day: isNotEmpty('Day is required'),
                start: isNotEmpty('Start time is required'),
                end: isNotEmpty('End time is required'),
            },

            // Contacts Validation
            contacts: {
                [formRootRule]: isNotEmpty('At least one services is required'),
                contact_type: (value) => (!value ? 'Select a type' : null),
                contact_detail: (value, values, path) => {
                    const index = parseInt(path.split('.')[1]);
                    const type = values.contacts[index].contact_type;
                    if (!value) return 'Contact detail is required';
                    if (type === 'Email' && !/^\S+@\S+$/.test(value)) return 'Invalid email';
                    if ((type === 'Mobile' || type === 'Landline') && !/^\d+$/.test(value)) return 'Numbers only';
                    return null;
                }
            },

            // Nested Services, Procedures, and Requirements
            services: {
                [formRootRule]: isNotEmpty('At least one services is required'),
                name: isNotEmpty('Service name is required'),
                description: isNotEmpty('Service description is required'),
                procedures: {
                    [formRootRule]: isNotEmpty('At least one services is required'),
                    step: isNotEmpty('Procedure step is required'),
                },
                requirements: {
                    item: isNotEmpty('Requirement name is required'),
                }
            }
        },
    });


    const editor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder: 'This institution was ...' })],
        shouldRerenderOnTransaction: true,
        content: '',
        onUpdate({ editor }) {
            // This gets the HTML string and puts it in the form
            form.setFieldValue('description', editor.getHTML());
        },
    });


    const fetchprovince = async () => {
        try {
            const data = await getprovinces();
            const arrayData = Array.isArray(data) ? data : data.data;
            setprovince(arrayData ?? [])
        } catch (error) {
            console.error("Error fetching Data:", error);
        }
    }

    const fetchbrgy = async () => {
        try {
            const data = await getbarangay();
            const arrayData = Array.isArray(data) ? data : data.data;
            setbrgy(arrayData ?? [])
        } catch (error) {
            console.error("Error fetching Data:", error);
        }
    }

    const fetchcities = async () => {
        try {
            const data = await getcity();
            const arrayData = Array.isArray(data) ? data : data.data;
            setcity(arrayData ?? [])
        } catch (error) {
            console.error("Error fetching Data:", error);
        }
    }

    const fetchpurok = async () => {
        try {
            const data = await getpurok();

            const arrayData = Array.isArray(data) ? data : data.data;
            setpurok(arrayData ?? [])
        } catch (error) {
            console.error("Error fetching Data:", error);
        }
    }

    const loaddata = async () => {
        await fetchprovince();
        await fetchbrgy();
        await fetchcities();
        await fetchpurok();
    };

    const ophrfields = form.values.ophr.map((item, index) => (
        <Group key={index} mt="xs" align="flex-start">

            <Select
                key={form.key(`ophr.${index}.day`)}
                placeholder="Select Day"
                label={index === 0 ? "Day of Operation" : null}
                withAsterisk={index === 0}

                data={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                {...form.getInputProps(`ophr.${index}.day`)}
                flex={2}
            />
            <TimePicker
                key={form.key(`ophr.${index}.start`)}
                label={index === 0 ? "Start Time" : null}
                withAsterisk={index === 0}

                flex={1.5}
                withDropdown
                clearable
                format="12h"
                {...form.getInputProps(`ophr.${index}.start`)}
            />

            <TimePicker
                key={form.key(`ophr.${index}.end`)}
                flex={1.5}
                label={index === 0 ? "End Time" : null}
                withAsterisk={index === 0}

                clearable
                withDropdown
                format="12h"
                {...form.getInputProps(`ophr.${index}.end`)}
            />
            <ActionIcon
                color="red"
                variant="light"
                size="lg"
                onClick={() => form.removeListItem('ophr', index)}
                disabled={form.values.ophr.length === 1}
                mt={index === 0 ? 24 : 0}
            >
                <IconTrash size="1.2rem" />
            </ActionIcon>
        </Group>
    ));

    const serviceFields = form.values.services.map((service, sIndex) => (
        <Paper withBorder p="md" radius="md" key={sIndex} mb="xl" style={{ backgroundColor: '#fafafa' }}>
            <Group justify="space-between" mb="sm">
                <TextInput
                    key={form.key(`services.${sIndex}.name`)}
                    label={`Service #${sIndex + 1}`}
                    placeholder="e.g. Laboratory"
                    style={{ flex: 1 }}
                    withAsterisk
                    {...form.getInputProps(`services.${sIndex}.name`)}
                />

                <ActionIcon color="red" variant="subtle" onClick={() => form.removeListItem('services', sIndex)}>
                    <IconTrash size={18} />
                </ActionIcon>
            </Group>
            <TextInput
                label={`Service Description`}
                placeholder="e.g. The service offers"
                style={{ flex: 1 }}
                withAsterisk
                key={form.key(`services.${sIndex}.description`)}
                {...form.getInputProps(`services.${sIndex}.description`)}
            />

            <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                {/* --- PROCEDURES COLUMN --- */}
                <Stack gap="xs">
                    {service.procedures.map((_, pIndex) => (
                        <Group key={pIndex} gap="xs">
                            <TextInput
                                label={pIndex === 0 ? "Procedure / Step" : null}
                                placeholder={`Step ${pIndex + 1}`}
                                style={{ flex: 1 }}
                                withAsterisk={pIndex === 0}
                                key={form.key(`services.${sIndex}.procedures.${pIndex}.step`)}
                                {...form.getInputProps(`services.${sIndex}.procedures.${pIndex}.step`)}
                            />
                            <ActionIcon
                                color="red"
                                variant="transparent"
                                onClick={() => form.removeListItem(`services.${sIndex}.procedures`, pIndex)}
                                disabled={service.procedures.length === 1}
                            >
                                <IconTrash size={14} />
                            </ActionIcon>
                        </Group>
                    ))}
                    <Button
                        variant="subtle"
                        size="compact-xs"
                        leftSection={<IconCirclePlus size={14} />}
                        onClick={() => form.insertListItem(`services.${sIndex}.procedures`, { step: '' })}
                    >
                        Add Step
                    </Button>
                </Stack>

                {/* --- REQUIREMENTS COLUMN --- */}
                <Stack gap="xs">
                    {service.requirements.map((_, rIndex) => (
                        <Group key={rIndex} gap="xs">
                            <TextInput
                                label={rIndex === 0 ? "Requirement" : null}
                                placeholder="e.g. Valid ID"
                                style={{ flex: 1 }}
                                withAsterisk={rIndex === 0}
                                key={form.key(`services.${sIndex}.requirements.${rIndex}.item`)}
                                {...form.getInputProps(`services.${sIndex}.requirements.${rIndex}.item`)}
                            />
                            <ActionIcon
                                color="red"
                                variant="transparent"
                                onClick={() => form.removeListItem(`services.${sIndex}.requirements`, rIndex)}
                                disabled={service.requirements.length === 1}
                            >
                                <IconTrash size={14} />
                            </ActionIcon>
                        </Group>
                    ))}
                    <Button
                        variant="subtle"
                        size="compact-xs"
                        leftSection={<IconCirclePlus size={14} />}
                        onClick={() => form.insertListItem(`services.${sIndex}.requirements`, { item: '' })}
                    >
                        Add Requirement
                    </Button>
                </Stack>
            </SimpleGrid>
        </Paper>
    ));

    const handleOnClickServiceModal = (service) => {
        setSelectedService(service);
        open();
    };

    useEffect(() => {
        loaddata();
    }, []);



    const handleSubmit = async () => {
    if (loading) return;
    toggle(true);

    try {
        // 1. Create the base institution (Required first)
        const healthinsti = await addhealthInsti({
            health_insti_name: form.values.institutionName,
            geo_latitude: form.values.latitude,
            geo_longhitude: form.values.longitude,
            purok_code: form.values.purok,
            city_zip_code: form.values.city,
            provincial_code: form.values.province,
            brgy_code: form.values.barangay,
        });

        const instiID = healthinsti[0]?.health_insti_id;

        // 2. Fire off Description, Contacts, and Hours in PARALLEL
        // We don't need to wait for one to finish before starting the other
        const baseDetailsPromises = [
            addhealthInsti_desc({
                health_insti_id: instiID,
                hospitals_desc_content: form.values.description,
            }),
            ...form.values.contacts.map(contact => addhealthInsti_contacts({
                contact_detail: contact.contact_detail,
                contact_type: contact.contact_type,
                health_insti_id: instiID
            })),
            ...form.values.ophr.map(hr => addhealthInsti_ophr({
                health_insti_id: instiID,
                service_day: hr.day,
                service_start_time: hr.start,
                service_end_time: hr.end,
            }))
        ];

        await Promise.all(baseDetailsPromises);

        // 3. Handle Services
        // We still need the Service ID first, but we can parallelize the children
        for (const serviceItem of form.values.services) {
            const services = await addhealthInsti_services({
                health_insti_id: instiID,
                service_name: serviceItem.name,
                service_desc: serviceItem.description,
            });

            const serviceID = services[0]?.service_id;

            // Fire Procedures and Requirements for this service at the SAME TIME
            await Promise.all([
                ...serviceItem.procedures.map((proc, index) =>
                    addhealthInsti_services_procedures({
                        service_id: serviceID,
                        procedure_desc: proc.step,
                        seq_no: index + 1,
                    })
                ),
                ...serviceItem.requirements.map(req =>
                    addhealthInsti_services_requirements({
                        service_id: serviceID,
                        req_desc: req.item,
                    })
                )
            ]);
        }

        onSubmitSuccess();
    } catch (error) {
        console.error("Error submitting form:", error);
        notifications.show({
            color: "red",
            title: 'Submission Failed',
            message: 'There was an error submitting the institution. Please try again.',
        });
    } finally {
        toggle(false);
    }
};

    return (
        <>
            <Flex direction="column" style={{ height: 'auto', overflow: 'hidden' }}>
                <Flex style={{ flex: 1, overflow: 'hidden', minWidth: active === 5 ? '1200px' : '900px' }}>
                    <Box
                        w={'300px'}
                        h={490}
                        p="md"
                        style={{
                            borderRight: '1px solid #e9ecef',
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <Stepper
                            active={active}
                            onStepClick={setActive}
                            orientation="vertical"
                            allowNextStepsSelect={false}
                            h={600}
                            // This styling ensures the content doesn't indent under the labels
                            styles={{
                                content: {
                                    display: 'none' // We hide the internal content 
                                },
                                step: {
                                    marginBottom: '20px'
                                }
                            }}
                        >
                            <Stepper.Step label="Institution Basic Details" description="Basic info" />
                            <Stepper.Step label="Institution Description" description="Tell us more" />
                            <Stepper.Step label="Institution Operation Hours" description="Time details" />
                            <Stepper.Step label="Services Offered" description="What you offer" />
                            <Stepper.Step label="Contact Details" description="Reach us on" />
                            <Stepper.Step label="Review/Submit" description="Final check" />
                        </Stepper>
                    </Box>


                    {/* Content of Stepper */}
                    <Box style={{ flex: 1, paddingLeft: '10px', overflowY: 'auto', overflowX: 'hidden' }}>

                        {active === 0 && (
                            <Flex direction="column" gap="md">
                                <Text fw={500} size="xl">Basic Institutional Details</Text>
                                <Text size="sm" c="dimmed">All fields with <span style={{ color: 'red' }}>*</span> are required</Text>
                                <TextInput
                                    radius="md"
                                    label="Institution Name"
                                    placeholder="ex. SPMC"
                                    withAsterisk
                                    {...form.getInputProps('institutionName')}
                                />
                                <SimpleGrid cols={2} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>

                                    <Select
                                        label="Purok"
                                        placeholder="Purok Located"
                                        autoSelectOnBlur
                                        searchable
                                        withAsterisk

                                        data={
                                            purok.map(p => ({
                                                value: String(p.purok_code),
                                                label: p.purok_name,
                                            }))
                                        }
                                        {...form.getInputProps('purok')}
                                    />

                                    <Select
                                        label="Barangay"
                                        placeholder="Barangay located"
                                        autoSelectOnBlur
                                        searchable
                                        withAsterisk

                                        data={brgy?.map(b => ({
                                            value: String(b.brgy_code),
                                            label: b.brgy_name,
                                        })) || []}
                                        {...form.getInputProps('barangay')}
                                    />

                                    <Select
                                        label="City"
                                        placeholder="City Located"
                                        autoSelectOnBlur
                                        searchable
                                        withAsterisk
                                        data={city?.map(c => ({
                                            value: String(c.city_zip_code),
                                            label: c.city_name,
                                        })) || []}
                                        {...form.getInputProps('city')}
                                    />

                                    <Select
                                        label="Province"
                                        placeholder="Province Located"
                                        autoSelectOnBlur
                                        searchable
                                        withAsterisk
                                        data={province?.map(p => ({
                                            value: String(p.province_code),
                                            label: p.province_name,
                                        })) || []}
                                        {...form.getInputProps('province')}
                                    />

                                    <NumberInput
                                        label="Longitude"
                                        description="Please refer to Google Maps for accurate coordinates"
                                        placeholder="ex. 12.0921213"
                                        withAsterisk
                                        hideControls
                                        {...form.getInputProps('longitude')}
                                    />

                                    <NumberInput
                                        label="Latitude"
                                        description="Please refer to Google Maps for accurate coordinates"
                                        placeholder="ex. 7.8121212"
                                        withAsterisk
                                        hideControls
                                        {...form.getInputProps('latitude')}
                                    />
                                </SimpleGrid>
                            </Flex>
                        )
                        }

                        {active === 1 && (
                            <Flex direction="column" gap="md">
                                <Text fw={500} size="xl">Institution Description</Text>
                                <RichTextEditor editor={editor} onSourceCodeTextSwitch={onSourceCodeTextSwitch} >
                                    <RichTextEditor.Toolbar>
                                        <RichTextEditor.ControlsGroup>
                                            <RichTextEditor.SourceCode icon={IconBold} />
                                        </RichTextEditor.ControlsGroup>

                                        {!isSourceCodeModeActive && (
                                            <RichTextEditor.Toolbar >
                                                <RichTextEditor.ControlsGroup>
                                                    <RichTextEditor.Blockquote />
                                                    <RichTextEditor.Bold />
                                                    <RichTextEditor.Italic />
                                                    <RichTextEditor.Underline />
                                                    <RichTextEditor.Strikethrough />
                                                    <RichTextEditor.ClearFormatting />
                                                    <RichTextEditor.Highlight />
                                                    <RichTextEditor.BulletList />

                                                </RichTextEditor.ControlsGroup>
                                                <RichTextEditor.ControlsGroup >
                                                    <RichTextEditor.H1 />
                                                    <RichTextEditor.H2 />
                                                    <RichTextEditor.H3 />
                                                    <RichTextEditor.H4 />
                                                </RichTextEditor.ControlsGroup>
                                            </RichTextEditor.Toolbar>
                                        )}
                                    </RichTextEditor.Toolbar>

                                    <RichTextEditor.Content
                                        style={{
                                            height: 360,        // Sets the steady height
                                            overflowY: 'auto'   // Enables vertical scrollbar when content exceeds 300px
                                        }}
                                    />
                                </RichTextEditor>
                            </Flex>
                        )
                        }

                        {active === 2 && (
                            <Flex direction="column" gap="md">
                                <Text fw={500} size="xl">Institution operational hours</Text>
                                <Text size="sm" c="dimmed">All fields with <span style={{ color: 'red' }}>*</span> are required</Text>

                                <Box maw={500} mx="auto">

                                    {ophrfields}

                                    <Group justify="center" mt="md">
                                        <Button
                                            onClick={() =>
                                                form.insertListItem('ophr', { day: '', start: '', end: '' })
                                            }
                                        >
                                            Add new schedule
                                        </Button>
                                    </Group>
                                </Box>



                            </Flex>
                        )
                        }

                        {active === 3 && (
                            <Flex direction="column" gap="md">
                                <Text fw={500} size="xl">Services Offfer</Text>
                                <Text size="sm" c="dimmed">All fields with <span style={{ color: 'red' }}>*</span> are required</Text>
                                <Box style={{
                                    height: 420,        // Sets the steady height
                                    overflowY: 'auto'   // Enables vertical scrollbar when content exceeds 300px
                                }}>
                                    {serviceFields}




                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        onClick={() => form.insertListItem('services', { name: '', procedures: [{ step: '' }], requirements: [{ item: '' }] })}
                                    >
                                        Add New Service
                                    </Button>
                                </Box>
                            </Flex>
                        )
                        }



                        {active === 4 && (
                            <Flex direction="column" gap="md">
                                <Text fw={500} size="xl">Contact Details</Text>
                                <Text size="sm" c="dimmed">All fields with <span style={{ color: 'red' }}>*</span> are required</Text>
                                <Text size="sm" c="dimmed">How can people reach this institution?</Text>

                                <Box maw={600}>
                                    {form.values.contacts.map((contact, index) => (
                                        <Group key={index} mt="xs" align="flex-start">
                                            <div style={{ flex: 1, minHeight: '70px' }}>
                                                <Select
                                                    label="Contact Type"
                                                    placeholder="Pick type"
                                                    withAsterisk
                                                    required
                                                    data={[
                                                        { value: 'Mobile', label: 'Mobile' },
                                                        { value: 'Landline', label: 'Landline' },
                                                        { value: 'Email', label: 'Email' },
                                                        { value: 'Facebook', label: 'Facebook' },
                                                        { value: 'Website', label: 'Website' }
                                                    ]}
                                                    {...form.getInputProps(`contacts.${index}.contact_type`)}
                                                />
                                            </div>
                                            <div style={{ flex: 2, minHeight: '70px' }}>
                                                <TextInput
                                                    label="Detail"
                                                    withAsterisk
                                                    required
                                                    {...form.getInputProps(`contacts.${index}.contact_detail`)}
                                                    /* Dynamic Type Logic */
                                                    type={
                                                        contact.contact_type === 'Email' ? 'email' :
                                                            (contact.contact_type === 'Mobile' || contact.contact_type === 'Landline') ? 'tel' :
                                                                'text'
                                                    }
                                                    /* Dynamic Placeholder Logic */
                                                    placeholder={
                                                        contact.contact_type === 'Email' ? 'e.g hello@domain.com' :
                                                            contact.contact_type === 'Mobile' ? 'e.g 09123456789' :
                                                                contact.contact_type === 'Website' ? 'e.g https://...' :
                                                                    'Enter Contact detail'
                                                    }
                                                    /* Optional: Simple pattern validation for numbers */
                                                    onKeyPress={(event) => {
                                                        if ((contact.contact_type === 'Mobile' || contact.contact_type === 'Landline') && !/[0-9]/.test(event.key)) {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => form.removeListItem('contacts', index)}
                                                disabled={form.values.contacts.length === 1}
                                                mt={5}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    ))}

                                    <Button
                                        variant="outline"
                                        mt="md"
                                        leftSection={<IconPlus size={14} />}
                                        onClick={() => form.insertListItem('contacts', { contact_type: '', contact_detail: '' })}
                                    >
                                        Add another contact
                                    </Button>
                                </Box>
                            </Flex>
                        )
                        }

                        {active === 5 && (

                            <Flex direction="column" gap="md">
                                <Text fw={500} size="xl">Confirmation and Review</Text>
                                <Paper shadow="sm" radius="md" p="xl" withBorder>
                                    <Stack gap="md">
                                        <Box>
                                            <Title order={2} c="blue">{form.values.institutionName || "Untitled Institution"}</Title>
                                            <Group gap="xs" mt={4} align="flex-start" wrap="nowrap">
                                                <IconInfoCircle size={18} style={{ marginTop: 4 }} c="dimmed" />

                                                {/* If description exists, render HTML; otherwise show fallback */}
                                                {form.values.description ? (
                                                    <TypographyStylesProvider>
                                                        <div
                                                            size="sm"
                                                            dangerouslySetInnerHTML={{ __html: form.values.description }}
                                                        />
                                                    </TypographyStylesProvider>
                                                ) : (
                                                    <Text size="sm" c="dimmed">No description provided.</Text>
                                                )}
                                            </Group>
                                        </Box>

                                        <Divider />


                                        <Stack gap={5}>
                                            <Group gap="xs">
                                                <IconMapPin size={20} color="gray" />
                                                <Text fw={600}>Location Details</Text>
                                            </Group>
                                            <Box pl={28}>

                                                <Text size="sm">
                                                    <Text component="span" fw={700}>Latitude:</Text> {form.values.latitude || 'N/A'}
                                                </Text>

                                                <Text size="sm">
                                                    <Text component="span" fw={700}>Longitude:</Text> {form.values.longitude || 'N/A'}
                                                </Text>

                                                <Text size="sm">
                                                    <Text component="span" fw={700}>Purok Code:</Text> {form.values.purok || 'None'}
                                                </Text>

                                                <Text size="sm">
                                                    <Text component="span" fw={700}>Brgy Code:</Text> {form.values.barangay || 'None'}
                                                </Text>

                                                <Text size="sm">
                                                    <Text component="span" fw={700}>City Zip Code:</Text> {form.values.city || 'None'}
                                                </Text>

                                                <Text size="sm">
                                                    <Text component="span" fw={700}>Province Code:</Text> {form.values.province || 'None'}
                                                </Text>
                                            </Box>
                                        </Stack>
                                        <Divider />
                                        <Stack gap={5}>
                                            <Group gap="xs">
                                                {/* Changed to a more appropriate icon for Contacts */}
                                                <IconPhone size={20} color="gray" />
                                                <Text fw={600}>Contact Details</Text>
                                            </Group>

                                            <Box pl={28}>
                                                {form.values.contacts.map((contact, index) => (
                                                    // Note the use of parentheses () instead of curly braces {} 
                                                    // to implicitly return the JSX
                                                    contact.contact_type && contact.contact_detail ? (
                                                        <Text key={index} size="sm">
                                                            <Text component="span" fw={700}>{contact.contact_type}:</Text> {contact.contact_detail}
                                                        </Text>
                                                    ) : null
                                                ))}

                                                {/* Fallback if no contacts are provided */}
                                                {form.values.contacts.length === 0 && (
                                                    <Text size="sm" c="dimmed" fs="italic">No contact information provided.</Text>
                                                )}
                                            </Box>
                                        </Stack>


                                        <Divider />

                                        {/* Services Section */}
                                        <Stack gap="xs">
                                            <Group gap="xs">
                                                <IconSettings2 size={20} color="gray" />
                                                <Text fw={600}>Services Offer</Text>
                                            </Group>

                                            <Modal
                                                opened={opened}
                                                onClose={close}
                                                title={selectedService?.name}
                                                centered
                                                size="lg"
                                            >
                                                {selectedService && (
                                                    <Stack gap="xl">
                                                        {/* Requirements Section */}
                                                        <Box>
                                                            <Text fw={700} mb="xs">Requirements</Text>
                                                            <List
                                                                spacing="xs"
                                                                size="sm"
                                                                center
                                                                icon={
                                                                    <ThemeIcon color="teal" size={24} radius="xl">
                                                                        <IconCircleCheck size={16} />
                                                                    </ThemeIcon>
                                                                }
                                                            >
                                                                {selectedService.requirements.map((req, i) => (
                                                                    <List.Item key={i}>{req.item || "Generic Requirement"}</List.Item>
                                                                ))}
                                                            </List>
                                                        </Box>

                                                        <Divider />

                                                        {/* Procedures Section */}
                                                        <Box>
                                                            <Text fw={700} mb="xs">Step-by-Step Process</Text>
                                                            <List
                                                                spacing="md"
                                                                size="sm"
                                                                type="ordered" // Shows 1, 2, 3...
                                                            >
                                                                {selectedService.procedures.map((proc, i) => (
                                                                    <List.Item key={i}>
                                                                        <Text size="sm">{proc.step || "Step description"}</Text>
                                                                    </List.Item>
                                                                ))}
                                                            </List>
                                                        </Box>
                                                    </Stack>
                                                )}
                                            </Modal>

                                            <Group gap="xs" pl={28}>
                                                {form.values.services.map((service, index) => (
                                                    service.name && (
                                                        <Badge
                                                            key={index}
                                                            variant="light"
                                                            color="blue"
                                                            size="lg"
                                                            style={{ cursor: 'pointer' }} // Visual cue for clickability
                                                            onClick={() => handleOnClickServiceModal(service)}
                                                        >
                                                            {service.name}
                                                        </Badge>
                                                    )
                                                ))}
                                            </Group>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Flex>
                        )
                        }

                    </Box>
                </Flex>

                <Box
                    p={10}
                    style={{
                        borderTop: '1px solid #e9ecef',
                        backgroundColor: 'white'
                    }}
                >
                    <Group justify="flex-end">
                        {active === 0 ? null : (
                            <Button variant="subtle" color="gray" onClick={prevStep} disabled={active === 0}>
                                Back
                            </Button>
                        )}


                        {active === 5 ? (
                            <Button
                                onClick={handleSubmit}
                                // loading={loading} // This is the key change
                                loaderProps={{ type: 'dots' }} // Optional: customize the spinner style
                            >
                                Save Data
                            </Button>
                        ) : (
                            <Button onClick={nextStep}>Next step</Button>
                        )}
                    </Group>
                </Box>
            </Flex >
        </>

    )

}
