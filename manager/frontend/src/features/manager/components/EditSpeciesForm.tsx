import EditForm from './EditForm'
import { updateSpecies, type Species } from '../../../apis/manager.api'

interface Props {
    species: Species
    onClose: () => void
    onSaved: (updated: Species) => void
}

const IUCN_OPTIONS = [
    { label: 'None', value: ''},
    { label: 'LC - Least Concern', value: 'LC'},
    { label: 'NT - Near Threatened', value: 'NT'},
    { label: 'VU - Vulnerable', value: 'VU'},
    { label: 'EN - Endangered', value: 'EN'},
    { label: 'CR - Critically Endangered', value: 'CR'},
    { label: 'EW - Extinct in the Wild', value: 'EW'},
    { label: 'EX - Extinct', value: 'EX'},
    { label: 'DD - Data Deficient', value: 'DD'},
    { label: 'NE - Not Evaluated', value: 'NE'},
    { label: 'NA - Not Applicable', value: 'NA'},
]

export default function EditSpeciesForm({ species, onClose, onSaved }: Props) {
    return (
        <EditForm
            title={species.commonName}
            subtitle={species.scientificName}
            fields={[
                { label: 'Native', key: 'native', type: 'select', options: [{ label: 'Native', value: 'true' }, { label: 'Non-native', value: 'false' }] },
                { label: 'Taxa', key: 'taxa', type: 'select', options: [{ label: 'Bird', value: 'bird' }, { label: 'Mammal', value: 'mammal' }, { label: 'Reptile', value: 'reptile' }] },
                { label: 'Indicator', key: 'indicator', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
                { label: 'Reportable', key: 'reportable', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
                { label: 'IUCN Status', key: 'iucnStatus', type: 'select', options: IUCN_OPTIONS },
            ]}
            initialValues={{
                native: String(species.native),
                taxa: species.taxa,
                indicator: String(species.indicator),
                reportable: String(species.reportable),
                iucnStatus: species.iucnStatus,
            }}
            onClose={onClose}
            onSave={(values) => updateSpecies(species.id, {
                native: values.native === 'true',
                taxa: String(values.taxa),
                indicator: values.indicator === 'true',
                reportable: values.reportable === 'true',
                iucnStatus: values.iucnStatus ? String(values.iucnStatus) : null,
            })}
            onSaved={onSaved}
        />
    )
}